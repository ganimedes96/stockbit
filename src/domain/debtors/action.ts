"use server";
import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { DebdorsCreate, Installments, StatusDebtor } from "./types";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { StockMovementType } from "../movements/types";

export async function createDebtor(
  companyId: string,
  debtorData: DebdorsCreate
): Promise<ResponseServerAction> {
  try {
    // Inicia a Transação Atômica.
    // Tudo aqui dentro ou funciona por completo, ou é desfeito (rollback).
    await db.runTransaction(async (transaction) => {
      
      // Cria uma referência para a NOVA dívida ANTES de salvar.
      // Isso nos dá o ID para podermos linkar nas movimentações.
      const newDebtorRef = db
        .collection(Collections.companies)
        .doc(companyId)
        .collection(Collections.debtors)
        .doc();

      //  Itera sobre cada produto da venda para validar e atualizar o estoque.
      for (const productSold of debtorData.products) {
        
        const productRef = db.collection(Collections.companies).doc(companyId).collection(Collections.products).doc(productSold.productId);
        
        // LÊ o documento do produto DENTRO da transação.
        // Isso garante que estamos lendo o estoque mais atualizado no momento da transação.
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists) {
          throw new Error(`Produto com ID ${productSold.productId} não foi encontrado.`);
        }

        const productData = productSnap.data();
        const currentStock = productData?.openingStock || 0;

        // VALIDA o estoque. Se esta condição falhar, a transação inteira é cancelada.
        if (productSold.quantity > currentStock) {
          throw new Error(`Estoque insuficiente para o produto: "${productData?.name}". Disponível: ${currentStock}`);
        }

        const newStock = currentStock - productSold.quantity;
        
        // PREPARA o registro de movimentação, incluindo o link para a nova dívida.
        const newMovementRef = db.collection(Collections.companies).doc(companyId).collection(Collections.movements).doc();
        const movementBody = {
          type: StockMovementType.STOCK_OUT,
          reason: "Venda a Prazo",
          quantity: productSold.quantity,
          responsible: "admin",
          sku: productData?.sku || "N/A",
          productId: productSold.productId,
          productName: productData?.name || "Nome não disponível",
          productPrice: productSold.priceUnit, // Usa o preço da venda
          debtId: newDebtorRef.id, // O LINK!
          description: debtorData.description || "Nenhuma descrição fornecida",
          createdAt: firestore.Timestamp.now(),
        };

        //  ADICIONA as duas escritas (update do produto e create da movimentação) à fila da transação.
        transaction.update(productRef, { openingStock: newStock });
        transaction.set(newMovementRef, movementBody);
      }
      
      //  PREPARA o corpo final da dívida, convertendo as datas para Timestamps do Firestore.
      const debtorBody = {
        ...debtorData,
        createdAt: firestore.Timestamp.now(),
        // Converte todas as datas do cliente para o formato do Firestore
        cashPayment: debtorData.cashPayment
          ? { ...debtorData.cashPayment, dueDate: firestore.Timestamp.fromDate(debtorData.cashPayment.dueDate) }
          : undefined,
        paymentInInstallments: debtorData.paymentInInstallments
          ? { ...debtorData.paymentInInstallments, dueDate: firestore.Timestamp.fromDate(debtorData.paymentInInstallments.dueDate) }
          : undefined,
        installments: (debtorData.installments ?? []).map((i) => ({
          ...i,
          dueDate: firestore.Timestamp.fromDate(i.dueDate),
        })),
      };

      //  ADICIONA a escrita da dívida à fila da transação.
      transaction.set(newDebtorRef, debtorBody);
    });

    // Se o código chegou até aqui, a transação foi bem-sucedida.
    return {
      status: StatusServer.success,
      message: "Venda registrada e estoque atualizado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar dívida e movimentar estoque", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      // Retorna a mensagem de erro específica (ex: "Estoque insuficiente...")
      message: err.message, 
    };
  }
}

export async function updateInstallmentStatus(
  companyId: string,
  debtId: string,
  installmentNumber: number,
  newStatus: StatusDebtor
) {
  try {
    // 1. Obter a referência do documento
    const debtorRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.debtors)
      .doc(debtId);

    // 2. Ler os dados atuais do documento
    const debtorDoc = await debtorRef.get();
    if (!debtorDoc.exists) {
      throw new Error("Dívida não encontrada.");
    }

    const debtData = debtorDoc.data();
    const installments = debtData?.installments;

    if (!installments || !Array.isArray(installments)) {
      throw new Error("Nenhuma parcela encontrada para esta dívida.");
    }

    // 3. Mapear o array para criar a nova versão com o status atualizado
    let installmentFound = false;
    const updatedInstallments = installments.map((inst) => {
      if (inst.installment === installmentNumber) {
        installmentFound = true;
        return { ...inst, status: newStatus };
      }
      return inst;
    });

    if (!installmentFound) {
      throw new Error(`Parcela número ${installmentNumber} não encontrada.`);
    }

    // 4. Construir o objeto de atualização (payload)
    const updatePayload: {
      installments: Installments[];
      updatedAt: FirebaseFirestore.Timestamp;
      statusDebtor?: StatusDebtor;
    } = {
      installments: updatedInstallments,
      updatedAt: firestore.Timestamp.now(),
    };

    // 5. Verificar se TODAS as parcelas agora estão pagas
    const allPaid = updatedInstallments.every(
      (inst) => inst.status === StatusDebtor.paid
    );

    // Se todas estiverem pagas, ADICIONA a atualização do status geral ao payload
    if (allPaid) {
      updatePayload.statusDebtor = StatusDebtor.paid;
    }

    // 6. Executar UMA ÚNICA operação de atualização no banco
    await debtorRef.update(updatePayload);

    return {
      status: StatusServer.success,
      message: "Status da parcela atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar status da parcela", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function updateDebtStatusCashPayment(
  companyId: string,
  debtId: string,
  newStatus: StatusDebtor
) {

  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.debtors)
      .doc(debtId)
      .update({
        statusDebtor: newStatus,
        updatedAt: firestore.Timestamp.now(),
      });

    return {
      status: StatusServer.success,
      message: "Status da dívida atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar status da dívida", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
