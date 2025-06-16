import { Movements, StockMovementType } from "./types";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export interface GetMovementsFilters {
  type?: StockMovementType;
  date?: Date;
  period?: "day" | "month";
}

export async function getMovements(companyId: string) {
  try {
    const productsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.movements
    );

    const productsQuery = query(productsRef, orderBy("createdAt", "desc"));
    const productsSnapshot = await getDocs(productsQuery);

    const movements: Movements[] = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Movements;
    });

    return movements;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function getMovementsFilter(
  companyId: string,
  filters?: GetMovementsFilters
): Promise<Movements[]> {
  try {
    // 1. Referência da coleção
    const movementsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.movements
    );

    // 2. Construção das constraints
    const constraints = [];

    // Filtro por tipo (entrada/saída)
    if (filters?.type) {
      constraints.push(where("type", "==", filters.type));
    }

    // Filtro por período (dia/mês)
    if (filters?.date && filters?.period) {
      const date =
        filters.date instanceof Date ? filters.date : new Date(filters.date);

      // Validação da data
      if (isNaN(date.getTime())) {
        throw new Error("Data inválida fornecida no filtro");
      }

      // Cálculo do intervalo
      const range = getDateRange(date, filters.period);

      constraints.push(
        where("createdAt", ">=", Timestamp.fromDate(range.start)),
        where("createdAt", "<=", Timestamp.fromDate(range.end))
      );
    }

    // Ordenação padrão
    constraints.push(orderBy("createdAt", "desc"));

    // 3. Execução da query
    const q = query(movementsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    // 4. Mapeamento dos resultados
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertToDate(data.createdAt),
        updatedAt: convertToDate(data.updatedAt),
      } as Movements;
    });
  } catch (error) {
    console.error("Error fetching movements:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch movements: ${error.message}`);
    } else {
      throw new Error("Failed to fetch movements: Unknown error");
    }
  }
}

// Funções auxiliares
function getDateRange(date: Date, period: "day" | "month") {
  return {
    start: period === "day" ? startOfDay(date) : startOfMonth(date),
    end: period === "day" ? endOfDay(date) : endOfMonth(date),
  };
}

function convertToDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return undefined;
}
