import { openDB, DBSchema } from 'idb';
import { Product } from '@/domain/product/types';
import { OrderInput } from '@/domain/orders/types';

// Define a "forma" do nosso banco de dados local
interface PdvDB extends DBSchema {
  products: {
    key: string;
    value: Product;
  };
  pendingOrders: {
    key: string; // Usaremos o orderNumber como chave
    value: OrderInput;
  };
}

// Abre (ou cria) o banco de dados e as "tabelas" (Object Stores)
const dbPromise = openDB<PdvDB>('pdv-database', 1, {
  upgrade(db) {
    db.createObjectStore('products', { keyPath: 'id' });
    db.createObjectStore('pendingOrders', { keyPath: 'orderNumber' });
  },
});

// Funções para interagir com o banco de dados
export const getLocalProducts = async () => (await dbPromise).getAll('products');
export const saveProductsLocally = async (products: Product[]) => {
  const db = await dbPromise;
  const tx = db.transaction('products', 'readwrite');
  await Promise.all(products.map(p => tx.store.put(p)));
  return tx.done;
};

export const saveOrderToQueue = async (order: OrderInput) => (await dbPromise).put('pendingOrders', order);
export const getPendingOrders = async () => (await dbPromise).getAll('pendingOrders');
export const removeOrderFromQueue = async (orderNumber: string) => (await dbPromise).delete('pendingOrders', orderNumber);