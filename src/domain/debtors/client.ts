"use client";
import {
  collection,
  getDocs,
  orderBy,
  query,
  getDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import {
  Debtors,
  FirestoreDebtorsData,
  FirestoreInstallment,
} from "./types";

export async function getDebtors(companyId: string): Promise<Debtors[]> {
  const debtorsRef = collection(
    db,
    Collections.companies,
    companyId,
    Collections.debtors
  );
  const q = query(debtorsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreDebtorsData;

    const processedData = {
      ...data,
      id: doc.id,

      createdAt: data.createdAt.toDate(),

      cashPayment: data.cashPayment?.dueDate
        ? { dueDate: data.cashPayment.dueDate.toDate() }
        : undefined,

      installments: data.installments
        ? data.installments.map((inst: FirestoreInstallment) => ({
            ...inst,
            dueDate: inst.dueDate.toDate(),
          }))
        : [],
    };

    return processedData as Debtors;
  });
}

export async function getDebtorById(companyId: string, debtorId: string) {
  const clientRef = doc(
    db,
    Collections.companies,
    companyId,
    Collections.debtors,
    debtorId
  );
  const debtorDoc = await getDoc(clientRef);
  if (!debtorDoc.exists()) {
    return null;
  }
  return { ...debtorDoc.data(), id: debtorDoc.id } as Debtors;
}

export async function getDebtorsByClientId(
  companyId: string,
  clientId: string
): Promise<Debtors[]> {
  const debtorsRef = collection(
    db,
    Collections.companies,
    companyId,
    Collections.debtors
  );

  const q = query(
    debtorsRef,
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    // 1. Tipamos os dados brutos com o nosso novo tipo FirestoreDebtorsData.
    const data = doc.data() as FirestoreDebtorsData;

    // 2. Agora, fazemos a conversão com total segurança de tipos.
    const processedData = {
      ...data,
      id: doc.id,
      // TypeScript sabe que data.createdAt é um Timestamp e aceita .toDate()
      createdAt: data.createdAt.toDate(),

      cashPayment: data.cashPayment?.dueDate
        ? { ...data.cashPayment, dueDate: data.cashPayment.dueDate.toDate() }
        : undefined,

      // TypeScript sabe que 'inst' é do tipo FirestoreInstallment...
      installments: data.installments
        ? data.installments.map((inst: FirestoreInstallment) => ({
            ...inst,
            // ...portanto, ele sabe que inst.dueDate é um Timestamp e aceita .toDate()
            dueDate: inst.dueDate.toDate(),
          }))
        : undefined,
    };

    // 3. No final, afirmamos que o objeto foi "montado" e agora corresponde ao tipo 'Debtors' do App.
    return processedData as Debtors;
  });
}
