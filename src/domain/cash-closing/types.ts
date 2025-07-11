export enum CashSessionStatus {
  FINALIZED = "FINALIZED",
  REOPENED = "REOPENED",
  OPEN = "OPEN",
}

export type CashClosing = {
  id: string;
  startingOpen: Date;
  closingDate: Date;
  openingBalance: number;
  totalSalesValue: number;
  expectedCashAmount: number;
  countedCashAmount: number;
   status: CashSessionStatus;
  difference: number;
  salesByPaymentMethod: Record<string, number>;
  operatorId: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
};




export type ClosingInput = {
  openingBalance: number;
  startingOpen: Date;
  countedCashAmount: number;
  operatorId: string;
  status: CashSessionStatus;
  closingDate?: Date;
  notes?: string;
  id?: string;
};

export type CashClosingInput = Omit<CashClosing, "id" | "updatedAt">;
export type CloseCashSessionInput = Pick<CashClosing, "countedCashAmount" | "notes">;