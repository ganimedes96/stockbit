"use client";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import { Order } from "./types";
import { startOfDay, endOfDay } from "date-fns";

export async function getOrders(
  companyId: string,
  filters: { status: string; search?: string }
): Promise<Order[]> {
  try {
   const ordersRef = collection(db, Collections.companies, companyId, Collections.orders);

        // Começamos com as cláusulas de query que sempre estarão presentes
        const queryConstraints: import("firebase/firestore").QueryConstraint[] = [orderBy("createdAt", "desc")];

        // Adiciona o filtro de status, se não for 'all'
        if (filters?.status && filters?.status !== "all") {
            if (filters.status === 'today') {
                const todayStart = startOfDay(new Date());
                const todayEnd = endOfDay(new Date());
                queryConstraints.push(where("createdAt", ">=", todayStart));
                queryConstraints.push(where("createdAt", "<=", todayEnd));
            } else {
                queryConstraints.push(where("status", "==", filters.status));
            }
        }

        // Adiciona o filtro de busca de texto (leia a nota abaixo)
        if (filters?.search) {
             queryConstraints.push(where("customerName", ">=", filters.search));
             queryConstraints.push(where("customerName", "<=", filters.search + '\uf8ff'));
        }

        const q = query(ordersRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);

    const orders = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(), 
        updatedAt: data.updatedAt?.toDate(),
      } as Order;
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}


export function getRealtimeOrders(
  companyId: string,
  filters: { status: string; search?: string },
  callback: (orders: Order[]) => void,
  onError: (error: Error) => void
) {
  const ordersRef = collection(db, Collections.companies, companyId, Collections.orders);

  // A lógica de montar a query com os filtros continua a mesma
  const queryConstraints: import("firebase/firestore").QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (filters.status && filters.status !== "all") {
    if (filters.status === 'today') {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      queryConstraints.push(where("createdAt", ">=", todayStart));
      queryConstraints.push(where("createdAt", "<=", todayEnd));
    } else {
      queryConstraints.push(where("status", "==", filters.status));
    }
  }
  // A busca por texto no cliente é mais fácil em tempo real, então faremos lá
  
  const q = query(ordersRef, ...queryConstraints);

  // A MÁGICA ACONTECE AQUI: Usamos onSnapshot em vez de getDocs
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data() 
      // Lógica de conversão de Timestamps para Dates
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Order;
    });

    // Em vez de retornar, chama o callback com os dados atualizados
    callback(orders);
  }, 
  (error) => {
    console.error("Erro no listener de pedidos:", error);
    onError(error);
  });

  // Retorna a função para se "desinscrever" do listener
  return unsubscribe;
}