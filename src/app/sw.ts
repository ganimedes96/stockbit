/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { getPendingOrders, removeOrderFromQueue } from "@/lib/db/indexed-db";
// REMOVIDO: Não importamos mais a server action aqui.

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: WorkerGlobalScope;

const handleSync = async () => {
  console.log("Evento de sincronização recebido!");
  const pendingOrders = await getPendingOrders();
  if (pendingOrders.length === 0) return;

  console.log(`Sincronizando ${pendingOrders.length} pedido(s)...`);

  for (const order of pendingOrders) {
    try {
      // CORREÇÃO: Faz uma chamada fetch para a nossa API Route
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          orderData: order, 
          companyId: order.companyId // Supondo que você salve o companyId no pedido
        }),
      });

      if (response.ok) {
        console.log(`Pedido ${order.orderNumber} sincronizado com sucesso!`);
        await removeOrderFromQueue(order.orderNumber!);
      } else {
        const errorData = await response.json();
        console.error(`Falha ao sincronizar pedido ${order.orderNumber}: ${errorData.message}`);
      }
    } catch (error) {
      console.error(`Erro de rede ao sincronizar pedido ${order.orderNumber}:`, error);
      // O pedido permanecerá na fila para a próxima tentativa.
    }
  }
};

self.addEventListener('sync', (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === 'sync-pending-orders') {
    syncEvent.waitUntil(handleSync());
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: defaultCache,
  skipWaiting: true,
  clientsClaim: true,
});
serwist.addEventListeners();
