/// <reference lib="webworker" />
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { getPendingOrders, removeOrderFromQueue } from "@/lib/db/indexed-db";




// Declaração para o TypeScript entender as variáveis globais
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: WorkerGlobalScope;


const runtimeCaching = [
  {
    matcher: /^\/$/,
    handler: new NetworkFirst({
      cacheName: 'pages',
    }),
  },
  {
    matcher: /^\/.*$/,
    handler: new NetworkFirst({
      cacheName: 'pages',
    }),
  },
  {
    matcher: /\.(?:js|css)$/,
    handler: new CacheFirst({
      cacheName: 'static-resources',
    }),
  },
  {
    matcher: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: new CacheFirst({
      cacheName: 'images',
    }),
  },
];

// Função que processa a fila de sincronização
const handleSync = async () => {
  console.log("Evento de sincronização recebido! Tentando processar a fila...");
  const pendingOrders = await getPendingOrders();
  if (pendingOrders.length === 0) {
    console.log("Nenhum pedido pendente para sincronizar.");
    return;
  }

  console.log(`Sincronizando ${pendingOrders.length} pedido(s)...`);

  for (const order of pendingOrders) {
    try {
      // Faz a chamada fetch para a nossa API Route
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

      // Se a resposta do servidor for bem-sucedida (status 2xx)
      if (response.ok) {
        console.log(`Pedido ${order.orderNumber} sincronizado com sucesso!`);
        await removeOrderFromQueue(order.orderNumber!);
      } else {
        // Se o servidor respondeu com um erro (status 4xx ou 5xx)
        console.error(`Falha ao sincronizar pedido ${order.orderNumber}. Status: ${response.status}`);
        
        // Tenta ler a mensagem de erro se a resposta for JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Mensagem do servidor:", errorData.message);
        } else {
          // Se não for JSON, apenas loga o texto da resposta (pode ser um erro HTML)
          const errorText = await response.text();
          console.error("Resposta do servidor (não-JSON):", errorText);
        }
      }
    } catch (error) {
      // Este bloco captura erros de rede (ex: o servidor está offline)
      console.error(`Erro de rede ao sincronizar pedido ${order.orderNumber}:`, error);
      // O pedido permanecerá na fila para a próxima tentativa.
    }
  }
  console.log("Processo de sincronização concluído.");
};

self.addEventListener('sync', (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === 'sync-pending-orders') {
    syncEvent.waitUntil(handleSync());
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching,
  skipWaiting: true,
  clientsClaim: true,
});
serwist.addEventListeners();