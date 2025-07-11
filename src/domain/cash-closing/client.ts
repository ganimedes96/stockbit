import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase"; // Usa a instância do client-side DB
import { Collections } from "@/lib/firebase/collections";
import { CashSessionStatus, ClosingInput } from "./types"; // Importe os tipos corretos
import { endOfDay, startOfDay } from "date-fns";

/**
 * Busca o registro do último fechamento de caixa realizado, executando no lado do cliente.
 * @param companyId O ID da empresa.
 * @returns O objeto do último fechamento ou null se não for encontrado.
 */
export async function getDailyCashSessions(
  companyId: string,
  date: Date = new Date()
): Promise<ClosingInput | null> {
  try {
    const sessionsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.cashSessions
    );

    // Garante que 'date' é válido
    const safeDate = date ?? new Date();

    const startDate = startOfDay(safeDate);
    const endDate = endOfDay(safeDate);

    const q = query(
      sessionsRef,
      where("startingOpen", ">=", Timestamp.fromDate(startDate)),
      where("startingOpen", "<=", Timestamp.fromDate(endDate)),
      orderBy("startingOpen", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      openingBalance: data.openingBalance,
      countedCashAmount: data.countedCashAmount,
      status: data.status,
      operatorId: data.operatorId,
      startingOpen: data.startingOpen?.toDate?.(),
      closingDate: data.closingDate?.toDate?.(),
    } as ClosingInput;
  } catch (error) {
    console.error("Erro ao buscar a sessão de caixa do dia:", error);
    throw new Error("Falha ao buscar a sessão de caixa.");
  }
}

export async function getOpenCashSession(companyId: string) {
  try {
    const sessionsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.cashSessions
    );

    // 1. A query agora busca por status, não por data.
    // O 'in' permite que ela encontre tanto 'open' quanto um futuro 'reopened'.
    const q = query(
      sessionsRef,
      where("status", "in", [
        CashSessionStatus.OPEN,
        CashSessionStatus.REOPENED,
        
      ]),
      orderBy("startingOpen", "desc"), // Garante que pegamos a mais recente, se houver mais de uma por erro.
      limit(1)
    );

    const snapshot = await getDocs(q);

    // 2. Se não encontrou nada, significa que não há caixas abertos.
    if (snapshot.empty) {
      return null;
    }

    // 3. Se encontrou, retorna os dados da sessão aberta.
    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      ...data,
      id: doc.id,
      status: data.status,
      startingOpen: data.startingOpen.toDate(),
      // closingDate será undefined, o que está correto para uma sessão aberta.
      closingDate: data.closingDate?.toDate(),
    };
  } catch (error) {
    console.error("Erro ao buscar sessão de caixa aberta:", error);
    throw new Error("Falha ao verificar o status do caixa.");
  }
}

