"use server";

import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { Order, OrderOrigin, PaymentMethodOrder } from "@/domain/orders/types";
import { CashClosing, CashSessionStatus } from "./types"; // Importe sua nova tipagem


export type ClosingInput = {
  countedCashAmount: number;
  notes?: string;
};

/**
 * Atualiza e fecha uma sessão de caixa existente.
 * Calcula os totais de vendas do período e atualiza o documento da sessão.
 * @param companyId O ID da empresa.
 * @param sessionId O ID da sessão de caixa a ser fechada.
 * @param closingInput Os dados inseridos pelo operador no fechamento.
 */
export async function closeCashRegister(
  companyId: string,
  sessionId: string, // A action agora precisa saber qual sessão fechar
  closingInput: ClosingInput
): Promise<ResponseServerAction> {
  try {
    const { countedCashAmount, notes } = closingInput;

    // 1. Cria uma referência direta para o documento da sessão que será atualizado.
    const sessionRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection("cashSessions") // Nome da coleção corrigido para o plural
      .doc(sessionId);

    // Usamos uma transação para garantir a consistência
    await db.runTransaction(async (transaction) => {
      // --- FASE DE LEITURA ---
      
      // Lê o documento da sessão para obter o saldo inicial e a data de abertura.
      const sessionDoc = await transaction.get(sessionRef);
      if (!sessionDoc.exists) {
        throw new Error("Sessão de caixa não encontrada ou já fechada.");
      }
      const sessionData = sessionDoc.data() as CashClosing;
      
      const openingBalance = sessionData.openingBalance;
      const startingOpen = sessionData.startingOpen; // Converte o Timestamp para Date
      const closingTime = new Date();

      // Busca todos os pedidos do PDV feitos durante esta sessão.
      const ordersRef = db.collection(Collections.companies).doc(companyId).collection(Collections.orders);
      const q = ordersRef
        .where("origin", "==", OrderOrigin.PDV)
        .where("createdAt", ">=", startingOpen)
        .where("createdAt", "<=", closingTime);

      const snapshot = await transaction.get(q);
      const orders = snapshot.docs.map((doc) => doc.data() as Order);

      // --- FASE DE CÁLCULO ---
      let totalSalesValue = 0;
      const salesByPaymentMethod: Record<string, number> = {
        [PaymentMethodOrder.cash]: 0,
        [PaymentMethodOrder.pix]: 0,
        [PaymentMethodOrder.creditCard]: 0,
        [PaymentMethodOrder.debitCard]: 0,
      };

      for (const order of orders) {
        totalSalesValue += order.total;
        if (salesByPaymentMethod[order.paymentMethod] !== undefined) {
          salesByPaymentMethod[order.paymentMethod] += order.total;
        }
      }

      const expectedCashAmount = openingBalance + salesByPaymentMethod.cash;
      const difference = countedCashAmount - expectedCashAmount;

      // --- FASE DE ESCRITA ---

      // Prepara o payload com os dados de fechamento para ATUALIZAR o documento.
      const updatePayload = {
        status: CashSessionStatus.FINALIZED,
        closingDate: firestore.Timestamp.fromDate(closingTime),
        totalSalesValue,
        expectedCashAmount,
        countedCashAmount,
        difference,
        salesByPaymentMethod,
        notes: notes || "",
        updatedAt: firestore.Timestamp.now(),
      };

      // Atualiza o documento da sessão existente com os novos dados.
      transaction.update(sessionRef, updatePayload);
    });

    return {
      status: StatusServer.success,
      message: "Caixa fechado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao fechar o caixa:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: `Falha ao fechar o caixa: ${err.message}`,
    };
  }
}


export async function openCashSession(
  companyId: string,
  operatorId: string,
  openingBalance: number
): Promise<ResponseServerAction & { sessionId?: string }> {
  try {
    

    const companyRef = db.collection(Collections.companies).doc(companyId);
    const sessionsRef = companyRef.collection(Collections.cashSessions  );

    // Usamos uma transação para garantir que a verificação e a criação sejam atômicas
    const newSessionId = await db.runTransaction(async (transaction) => {
      // 1. VERIFICAÇÃO: Procura por qualquer sessão que já esteja com o status 'open'
      const openSessionQuery = sessionsRef.where("status", "==", CashSessionStatus.OPEN).limit(1);
      const openSessionSnap = await transaction.get(openSessionQuery);

      if (!openSessionSnap.empty) {
        // Se encontrar uma, lança um erro para cancelar a transação.
        throw new Error("Já existe um caixa aberto. Por favor, feche o caixa anterior primeiro.");
      }

      // 2. CRIAÇÃO: Se não houver caixa aberto, prossegue com a criação.
      const newSessionRef = sessionsRef.doc(); // Gera um novo ID para a sessão

      const sessionData = {
        status: CashSessionStatus.OPEN,
        openingBalance: Number(openingBalance),
        operatorId: operatorId,
        startingOpen: new Date(),
        createdAt: new Date(),
        // Os campos de fechamento ficarão vazios por enquanto
      };

      // Enfileira a operação de criação na transação
      transaction.set(newSessionRef, sessionData);

      // Retorna o ID da nova sessão para ser usado fora da transação
      return newSessionRef.id;
    });

    return {
      status: StatusServer.success,
      message: "Caixa aberto com sucesso!",
      sessionId: newSessionId, // Retorna o ID da sessão criada
    };
  } catch (error) {
    console.error("Erro ao abrir o caixa:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}



export async function reopenCashSession(
  companyId: string,
  sessionId: string
): Promise<ResponseServerAction> {
  try {
    // A transação garante que a leitura e a escrita sejam atômicas.
    await db.runTransaction(async (transaction) => {
      // 1. Cria uma referência direta para o documento da sessão a ser reaberta.
      const sessionRef = db
        .collection(Collections.companies)
        .doc(companyId)
        .collection("cashSessions")
        .doc(sessionId);

      // 2. Lê o documento para garantir que ele existe e está no estado correto.
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists) {
        throw new Error("A sessão de caixa que você está tentando reabrir não foi encontrada.");
      }

      const sessionData = sessionDoc.data();

      // 3. Validação: Só podemos reabrir um caixa que está 'fechado'.
      if (sessionData?.status !== CashSessionStatus.FINALIZED) {
        throw new Error("Este caixa não está fechado e não pode ser reaberto.");
      }

      // 4. Prepara e executa a atualização.
      // Apenas o status e a data de atualização são alterados.
      transaction.update(sessionRef, {
        status: CashSessionStatus.REOPENED,
        updatedAt: firestore.Timestamp.now(),
        notes: `${sessionData?.notes || ''} [Sessão reaberta em ${new Date().toLocaleString('pt-BR')}]`.trim(),
      });
    });

    return {
      status: StatusServer.success,
      message: "Caixa reaberto com sucesso! Você já pode iniciar uma nova sessão.",
    };
  } catch (error) {
    console.error("Erro ao reabrir o caixa:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
