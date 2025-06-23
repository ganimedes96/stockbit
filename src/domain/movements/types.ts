export enum StockMovementType {
  STOCK_IN = 'STOCK_IN',       // Entrada
  STOCK_OUT = 'STOCK_OUT',     // Saída
}

export type Movements = {
  id: string;
  type: StockMovementType;
  productId: string;
  productName?: string;
  productPrice?: number;
  sku?: string;
  quantity: number;
  reason?: string;
  description?: string;
  responsible?: string;
  createdAt: Date;
  updatedAt: Date;
}


export type MovimentsInput = Omit<Movements, 'id' | 'createdAt' | 'updatedAt'>
export type MovimentsUpdate = Omit<Movements, 'createdAt' | 'updatedAt'>

