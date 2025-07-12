
export enum OrderStatus {
  Pending = "pending", // Pedido criado, aguardando pagamento
  Confirmed = "confirmed", // Pagamento confirmado, aguardando preparação
  Prepping = "preparing", // Preparando o pedido
  Shipped = "shipped", // Enviado
  Delivered = "delivered", // Entregue
  Cancelled = "cancelled", // Cancelado
  Refunded = "refunded", // Devolvido/Reembolsado
  completed = "completed",
}

 export type DailySummary = {
  totalRevenue: number;
  totalSalesCount: number;
  totalItemsSold: number;
  averageTicket: number;
  highestSaleValue: number;
  lowestSaleValue: number;
  salesByHour: Record<string, number>
  salesByPaymentMethod: Record<PaymentMethodOrder, { total: number; count: number }>;
};


export enum OrderOrigin {
  PDV = "pdv",
  Catalog = "catalog",
  Manual = "manual",
}

export enum PaymentMethodOrder {
  cash = "cash",
  pix = "pix",
  creditCard = "creditCard",
  debitCard = "debitCard",
}

export type LineItem = {
  productId: string;
  productName: string; // denormalizado
  sku?: string; // denormalizado
  unitPrice: number; // denormalizado
  quantity: number;
  totalPrice: number;
  photo: string; // denormalizado, opcional
};

export type ShippingAddress = {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state?: string;
  complement?: string;
};

export type Order = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderNumber?: string;
  status: OrderStatus;
  lineItems: LineItem[];
  shippingCost: number;
  discounts?: number;
  clientId?: string; // ID do cliente, se aplicável
  companyId?: string;
  subtotal: number;
  total: number;
  origin: OrderOrigin;
  paymentMethod: PaymentMethodOrder;
  shippingAddress?: ShippingAddress;
  notes?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderInput = Omit<Order, "id" | "createdAt" | "updatedAt">;
