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

export async function getMovementsByDate(
  companyId: string,
  filter: "day" | "month"
): Promise<Movements[]> {
  try {
    const now = new Date();

    const start =
      filter === "day" ? startOfDay(now) : startOfMonth(now);
    const end =
      filter === "day" ? endOfDay(now) : endOfMonth(now);

    const movementsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.movements
    );

    const movementsQuery = query(
      movementsRef,
      where("createdAt", ">=", Timestamp.fromDate(start)),
      where("createdAt", "<=", Timestamp.fromDate(end)),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(movementsQuery);

    const movements: Movements[] = snapshot.docs.map((doc) => {
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
    console.error("Erro ao buscar movimentações:", error);
    throw new Error("Erro ao buscar movimentações");
  }
}
