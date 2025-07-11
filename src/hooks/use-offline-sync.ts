"use client";

import { useState, useEffect } from 'react';
import { useCreatePdvOrder } from '@/domain/orders/queries';
import { OrderInput } from '@/domain/orders/types';
import { getDb } from '@/lib/db/indexed-db';
import { toast } from 'sonner';

export function useOfflineSync(companyId: string) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { mutateAsync: createPdvOrder } = useCreatePdvOrder(companyId);

  // 1. Efeito para detectar o status da conexão (online/offline)
  // Roda apenas uma vez quando o componente é montado.
  useEffect(() => {
    // Define o estado inicial com base no estado atual do navegador
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Função de limpeza para remover os listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Efeito para disparar a sincronização QUANDO a conexão voltar
  // Roda sempre que o estado 'isOnline' mudar para 'true'.
  useEffect(() => {
    const syncPendingOrders = async () => {
      // Previne múltiplas sincronizações ao mesmo tempo
      if (isSyncing) return;

      const db = await getDb();
      const pendingOrders = await db.getAll('pendingOrders');

      // Só mostra a notificação se realmente houver pedidos para sincronizar
      if (pendingOrders.length === 0) {
        return;
      }
      
      setIsSyncing(true);
      toast.info(`Sincronizando ${pendingOrders.length} pedido(s) pendente(s)...`);

      for (const order of pendingOrders) {
        try {
          const response = await createPdvOrder(order);
          if (response.status === 'success') {
            await db.delete('pendingOrders', order.orderNumber!);
            toast.success(`Pedido ${order.orderNumber} sincronizado!`);
          } else {
            toast.error(`Falha ao sincronizar pedido ${order.orderNumber}: ${response.message}`);
          }
        } catch (error) {
          console.error(`Falha crítica ao sincronizar pedido ${order.orderNumber}:`, error);
          toast.error(`Falha crítica ao sincronizar pedido ${order.orderNumber}.`);
        }
      }

      setIsSyncing(false);
    };

    // Se o status mudou para online, tenta sincronizar.
    if (isOnline) {
      syncPendingOrders();
    }
  }, [isOnline, createPdvOrder]); // Depende de 'isOnline' e da função de mutação

  // Função para salvar um pedido offline (sem alterações)
  const saveOrderOffline = async (orderData: OrderInput) => {
    try {
      const db = await getDb();
      await db.put('pendingOrders', orderData);
      toast.success("Venda salva offline! Será sincronizada quando a conexão voltar.");
    } catch (error) {
      toast.error(`Falha ao salvar venda offline: ${error}`);
    }
  };

  return { isOnline, isSyncing, saveOrderOffline };
}