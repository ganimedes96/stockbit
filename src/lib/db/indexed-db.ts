import { openDB, DBSchema } from 'idb';
import { OrderInput } from '@/domain/orders/types'; // Importe seu tipo

// Define a "forma" do nosso banco de dados local
interface PdvDB extends DBSchema {
  pendingOrders: {
    key: string;
    value: OrderInput;
  };
}

// Abre (ou cria) o banco de dados
export async function getDb() {
  return await openDB<PdvDB>('pdv-database', 1, {
    upgrade(db) {
      // Cria a "tabela" (Object Store) para guardar os pedidos pendentes
      db.createObjectStore('pendingOrders', {
        keyPath: 'orderNumber', // Usa o número do pedido como chave única
      });
    },
  });
}