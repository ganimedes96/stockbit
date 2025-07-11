// Em um arquivo como src/domain/orders/queries.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/tanstack-query/keys"; // Supondo que você tenha este arquivo de chaves
import { toast } from "sonner";
import { cancelOrderPdv, createOrder, createPdvOrder, updateOrderStatus } from "./action"; // A server action que criamos
import { OrderInput, OrderStatus } from "./types"; // O tipo de dados que a action espera
import { ResponseServerAction } from "@/api/types";
import { getDailyPdvOrders, getDailySummaryOnClient, getOrders, getRealtimeOrders } from "./clients";
import { useState, useEffect, useMemo } from "react";
import { Order } from "./types";
import { handleServerActionResponse } from "@/api/handler";

export const useCreateOrder = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseServerAction, Error, OrderInput>({
    mutationFn: (orderData: OrderInput) => createOrder(companyId, orderData),

    onSuccess: (response) => {
      if (response.status === "success") {
        toast.success(response.message);

        // A MÁGICA DA ATUALIZAÇÃO AUTOMÁTICA ACONTECE AQUI!
        // Invalidamos todas as queries que podem ter sido afetadas pela criação de um novo pedido.

        // Invalida a lista de produtos, pois o estoque mudou.
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.products, companyId],
        });

        // Invalida a lista de devedores e o resumo, pois um novo débito/venda foi criado.
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.debtors, companyId],
        });

        // Invalida o histórico de movimentações, pois novas saídas foram geradas.
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.movements, companyId],
        });

        // Invalida a lista de pedidos, caso você tenha uma.
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.orders, companyId],
        });
      } else {
        toast.error(response.message);
      }
    },

    // 4. Em Caso de Erro (onError):
    // Este callback é executado se a 'mutationFn' lançar um erro.
    onError: (error) => {
      toast.error(`Falha ao registrar pedido: ${error.message}`);
    },
  });
};

export const useUpdatOrderStatus = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseServerAction, // O que a mutação retorna em caso de sucesso
    Error, // O tipo do erro
    { orderId: string; status: OrderStatus } // O que a mutação precisa receber para funcionar (as variáveis)
  >({
    mutationFn: async ({ orderId, status }) => {
      // Aqui você chamaria uma server action para atualizar o status do pedido
      // Exemplo: return updateOrderStatus(companyId, orderId, status);
      return updateOrderStatus(companyId, orderId, status);
    },

    onSuccess: (response) => {
      if (response.status === "success") {
        toast.success(response.message);
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.orders, companyId],
        });
      } else {
        toast.error(response.message);
      }
    },

    onError: (error) => {
      toast.error(`Falha ao atualizar status do pedido: ${error.message}`);
    },
  });
};

export const useCreatePdvOrder = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseServerAction, // O que a mutação retorna em caso de sucesso
    Error, // O tipo do erro
    OrderInput // O que a mutação precisa receber para funcionar (as variáveis)
  >({
    mutationFn: async (orderData: OrderInput) => {
      // Aqui você chamaria uma server action para atualizar o status do pedido
      return createPdvOrder(companyId, orderData);
    },

    onSuccess: (response) => {
      if (response.status === "success") {
        toast.success(response.message);
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.orders, QueryKeys.products, companyId],
        });
      } else {
        toast.error(response.message);
      }
    },

    onError: (error) => {
      toast.error(`Falha ao atualizar status do pedido: ${error.message}`);
    },
  });
};

export const useGetOrders = (
  companyId: string,
  // O hook agora recebe os filtros
  filters: { status: string; search: string }
) => {
  return useQuery({
    // A queryKey agora inclui os filtros para criar um cache único para esta busca
    queryKey: [QueryKeys.orders, companyId, filters],

    // A queryFn agora passa os filtros para a função de busca
    queryFn: () => getOrders(companyId, filters),
  });
};

export const useRealtimeOrders = (
  companyId: string,
  filters: { status: string; search: string }
) => {
  // 1. Estados para guardar os dados, o carregamento e os erros.
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { status, search } = filters;
  // 2. useEffect para iniciar e parar o listener.
  // Ele roda sempre que o companyId ou os filtros mudarem.
  useEffect(() => {
    setIsLoading(true);

    // 3. Passamos um objeto de filtro para a função que contém APENAS o 'status',
    // pois a busca por texto é feita no cliente.
    const unsubscribe = getRealtimeOrders(
      companyId,
      { status }, // Passa apenas o filtro necessário para a query do Firestore
      (newOrders) => {
        setOrders(newOrders);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, status]);

  // Filtro de busca por texto é aplicado no cliente, sobre os dados recebidos em tempo real
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const lowercasedSearch = search.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(lowercasedSearch) ||
        order.customerName?.toLowerCase().includes(lowercasedSearch) ||
        order.customerEmail?.toLowerCase().includes(lowercasedSearch)
    );
  }, [orders, search]);

  // 6. O hook retorna os dados de forma parecida com o useQuery.
  return { data: filteredOrders, isLoading, error };
};


export const useCancelOrderPdv = (companyId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      return await cancelOrderPdv(companyId, orderId);
    },
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.orders,
        QueryKeys.products,
      ]);
    },
  });
};



export const useGetDailySummaryOnClient = (companyId: string, date: Date) => {
  return useQuery({
    // CORREÇÃO: A chave da query agora inclui a data.
    // Usamos .toISOString().split('T')[0] para obter uma string única para o dia (ex: "2024-07-15").
    // Isso garante que se o usuário mudar a data, a chave mudará e uma nova busca será feita.
    queryKey: [QueryKeys.orders, companyId, date.toISOString().split('T')[0]],
    
    // A queryFn continua a mesma, passando a data para a função de busca.
    queryFn: () => getDailySummaryOnClient(companyId, date),

    // Boa prática: só executa a query se a data for um valor válido.
    enabled: !!date,
  });
};

export const useGetDailyPdvOrders = (companyId: string, date: Date) => {
  return useQuery({
    // CORREÇÃO: A chave da query agora inclui a data.
    // Usamos .toISOString().split('T')[0] para obter uma string única para o dia (ex: "2024-07-15")
    // Isso garante que se o usuário mudar a data, a chave mudará e uma nova busca será feita.
    queryKey: [QueryKeys.orders, companyId, 'daily', date.toISOString().split('T')[0]],
    
    // A queryFn continua a mesma, passando a data para a função de busca.
    queryFn: () => getDailyPdvOrders(companyId, date),

    // Boa prática: só executa a query se a data for um valor válido.
    enabled: !!date,
  });
};