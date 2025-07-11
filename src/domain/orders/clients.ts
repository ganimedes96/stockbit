"use client";
import { collection, getDocs, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import { DailySummary, Order, OrderOrigin } from "./types";
import { startOfDay, endOfDay, getHours } from "date-fns";





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


export async function getDailySummaryOnClient(
  companyId: string,
  date: Date
): Promise<DailySummary> {
  try {
    // Define o início e o fim do dia para a query
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const ordersRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.orders
    );

    // A construção da query é a mesma, mas usa os imports do client-side SDK
    const q = query(
      ordersRef,
      where("origin", "==", OrderOrigin.PDV), // Filtra apenas vendas do PDV
      where("createdAt", ">=", Timestamp.fromDate(startDate)), // Converte Date para Timestamp
      where("createdAt", "<=", Timestamp.fromDate(endDate))
    );
      
    const snapshot = await getDocs(q);

    // O objeto de fallback para o caso de não haver vendas
    const emptySummary: DailySummary = {
        totalRevenue: 0,
        totalSalesCount: 0,
        totalItemsSold: 0,
        averageTicket: 0,
        highestSaleValue: 0,
        lowestSaleValue: 0,
        salesByPaymentMethod: { cash: {total: 0, count: 0}, pix: {total: 0, count: 0}, creditCard: {total: 0, count: 0}, debitCard: {total: 0, count: 0} },
        salesByHour:{},
      };

    if (snapshot.empty) {
      return emptySummary;
    }

    // A lógica de cálculo com .reduce() é idêntica à da server action
    const summary = snapshot.docs.reduce((acc, doc) => {
        const order = doc.data() as Order;
        
        acc.totalRevenue += order.total;
        acc.totalItemsSold += order.lineItems.reduce((sum, item) => sum + item.quantity, 0);

        if (order.total > acc.highestSaleValue) {
            acc.highestSaleValue = order.total;
        }
        if (acc.lowestSaleValue === 0 || order.total < acc.lowestSaleValue) {
            acc.lowestSaleValue = order.total;
        }
        
        const method = order.paymentMethod;
        if (acc.salesByPaymentMethod[method]) {
            acc.salesByPaymentMethod[method].total += order.total;
            acc.salesByPaymentMethod[method].count += 1;
        }
         const orderDate = (order.createdAt as unknown as Timestamp).toDate();
        const hour = getHours(orderDate);
        const hourKey = hour.toString().padStart(2, "0"); // Formata para "08", "09", etc.

        if (!acc.salesByHour[hourKey]) {
            acc.salesByHour[hourKey] = 0;
        }
        acc.salesByHour[hourKey] += order.total;

        return acc;
    }, { ...emptySummary }); // Inicia o acumulador com a estrutura zerada

    const totalSalesCount = snapshot.size;
    const averageTicket = totalSalesCount > 0 ? summary.totalRevenue / totalSalesCount : 0;

    return {
      ...summary,
      totalSalesCount,
      averageTicket,
    };

  } catch (error) {
    console.error("Erro ao buscar resumo diário no cliente:", error);
    // Lança o erro para que o TanStack Query possa capturá-lo
    throw new Error("Falha ao buscar o resumo de vendas.");
  }
}


export async function getDailyPdvOrders(
  companyId: string,
  date: Date 
): Promise<Order[]> {
  try {
    // 1. Define o início e o fim do dia para a query do Firestore.
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // 2. Cria a referência para a coleção 'orders'.
    const ordersRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.orders
    );

    // 3. Constrói a query para buscar os documentos corretos.
    const q = query(
      ordersRef,
      // Filtra apenas onde a origem é 'pdv'.
      where("origin", "==", OrderOrigin.PDV),
      // Filtra pelo intervalo de data do dia especificado.
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      // Ordena os resultados pelos mais recentes primeiro.
      orderBy("createdAt", "desc")
    );
      
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return []; // Retorna um array vazio se não houver vendas no dia.
    }

    // 4. Mapeia os resultados e converte os Timestamps do Firestore para objetos Date do JavaScript.
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data() 
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        // Adicione outras conversões de data aqui se necessário
      } as Order;
    });

    return orders;

  } catch (error) {
    console.error("Erro ao buscar pedidos do PDV no cliente:", error);
    // Lança o erro para que o TanStack Query possa capturá-lo.
    throw new Error("Falha ao buscar os pedidos do dia.");
  }
}
