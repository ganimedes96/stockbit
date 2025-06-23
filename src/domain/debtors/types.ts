import { Timestamp } from "firebase/firestore";


export enum Payment {
  cashPayment = "cashPayment",
  PaymentInInstallments = "PaymentInInstallments",
}


export enum PaymentMethod {
  cash = "cash",
  pix = "pix",
  creditCard = "creditCard",
  transfer = "transfer",
}



export enum StatusDebtor {
  pending = "pending",
  paid = "paid",
  overdue = "overdue",
}


export type Debtors = {
  id: string;
  clientId: string;
  products: ProductDebdor[];
  payment: Payment;
  paymentMethod?: PaymentMethod;
  cashPayment?: {
    dueDate:Date;
  };
  paymentInInstallments?: {
    dueDate: Date;
    installments: number;
    interval: number;
  };
  installments?:Installments[];
  statusDebtor: StatusDebtor;
  description?: string;
  totalSale: number;
  createdAt: Date;
  updatedAt?: Date;
};

export type ProductDebdor = {
  productId: string;
  quantity: number;
  priceUnit: number;
  total: number;
};


export type Installments = {
  dueDate: Date;
  installment: number;
  price: number;
  status: StatusDebtor;

}

// Tipo para uma parcela como ela vem do Firestore
export type FirestoreInstallment = Omit<Installments, "dueDate"> & {
  dueDate: Timestamp; // A única diferença: o tipo é Timestamp
};

// Tipo para o objeto de dívida como ele vem do Firestore (de doc.data())
export type FirestoreDebtorsData = Omit<Debtors, "id" | "createdAt" | "updatedAt" | "cashPayment" | "installments"> & {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  cashPayment?: {
    dueDate: Timestamp;
  };
  installments?: FirestoreInstallment[];
};

export type DebdorsCreate = Omit<Debtors, "id" | "createdAt" | "updatedAt">;

export type DebdorsUpdate = Omit<Debtors, "createdAt" | "updatedAt">;
