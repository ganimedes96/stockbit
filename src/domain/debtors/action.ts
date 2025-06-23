"use server";
import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { DebdorsCreate, Installments, StatusDebtor } from "./types";
import { StatusServer } from "@/api/types";

export async function createDebtor(companyId: string, debtor: DebdorsCreate) {
  try {
    console.log("debtor", debtor);
    
    const body = {
      ...debtor,
      paymentMethod: debtor.paymentMethod ||"",
      cashPayment: debtor.cashPayment
        ? {
            dueDate: firestore.Timestamp.fromDate(debtor.cashPayment.dueDate),
          }
        : undefined,
      paymentInInstallments: debtor.paymentInInstallments
        ? {
            dueDate: firestore.Timestamp.fromDate(
              debtor.paymentInInstallments.dueDate
            ),
            installments: debtor.paymentInInstallments.installments,
            interval: debtor.paymentInInstallments.interval,
          }
        : undefined,
      installments: (debtor.installments ?? []).map((i) => {
        return {
          installment: i.installment,
          price: i.price,
          dueDate: firestore.Timestamp.fromDate(i.dueDate),
          status: i.status,
        };
      }),
      createdAt: firestore.Timestamp.now(),
    };
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.debtors)
      .add(body);

    return {
      status: StatusServer.success,
      message: "Devedor criado com sucesso",
    };
  } catch (error) {
    console.error("Error creating client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
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
