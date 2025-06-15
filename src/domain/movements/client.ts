

import { Movements, StockMovementType } from "./types";
import {
  collection,
  getDocs,
  orderBy,
  query,
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
    const movementsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.movements
    );

    const constraints = [];

    // Filtro por tipo (entrada ou saída)
    if (filters?.type) {
      constraints.push(where("type", "==", filters.type));
    }

    // Filtro por período
    if (filters?.date && filters?.period) {
      const start =
        filters.period === "day"
          ? startOfDay(filters.date)
          : startOfMonth(filters.date);
      const end =
        filters.period === "day"
          ? endOfDay(filters.date)
          : endOfMonth(filters.date);

      constraints.push(where("createdAt", ">=", start));
      constraints.push(where("createdAt", "<=", end));
    }

    // Adiciona ordenação
    constraints.push(orderBy("createdAt", "desc"));

    const q = query(movementsRef, ...constraints);

    const querySnapshot = await getDocs(q);

    const movements: Movements[] = querySnapshot.docs.map((doc) => {
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
    console.error("Error fetching movements:", error);
    throw new Error("Failed to fetch movements");
  }
}