import {
  Debtors,
  Installments,
  Payment,
  StatusDebtor,
} from "@/domain/debtors/types";
import { isBefore, startOfDay } from "date-fns";


export type DebtorsSummary = {
  totalToReceive: number;
  totalOverdue: number;
  debtorClientsCount: number;
  salesThisMonth: number;
};

export const calculateOverdueAmount = (debt: Debtors, today: Date): number => {
  if (debt.statusDebtor === StatusDebtor.paid) {
    return 0;
  }

  const startOfToday = startOfDay(today);

  if (debt.payment === Payment.cashPayment && debt.cashPayment?.dueDate) {
    // CORREÇÃO: Garante que estamos comparando um objeto Date.
    const dueDate = new Date(debt.cashPayment.dueDate);
    if (isBefore(dueDate, startOfToday)) {
      return debt.totalSale;
    }
  } else if (
    debt.payment === Payment.PaymentInInstallments &&
    debt.installments
  ) {
    let overdueInstallmentsValue = 0;
    for (const installment of debt.installments) {
      if (installment.status !== StatusDebtor.paid) {
        // CORREÇÃO: Garante que estamos comparando um objeto Date.
        const installmentDueDate = new Date(installment.dueDate);
        if (isBefore(installmentDueDate, startOfToday)) {
          overdueInstallmentsValue += installment.price;
        }
      }
    }
    return overdueInstallmentsValue;
  }

  return 0;
};

export const getInstallmentStatus = (installment: Installments) => {
  const today = startOfDay(new Date());

  if (installment.status === StatusDebtor.paid) {
    return { text: "Pago", variant: "success" as const };
  }

  // CORREÇÃO: Garante que estamos comparando um objeto Date.
  const installmentDueDate = new Date(installment.dueDate);
  if (isBefore(installmentDueDate, today)) {
    return { text: "Em Atraso", variant: "destructive" as const };
  }

  return { text: "Pendente", variant: "outline" as const };
};

export const calculateTotalOwedForDebt = (debt: Debtors): number => {
  if (debt.statusDebtor === StatusDebtor.paid) {
    return 0;
  }

  if (debt.payment === Payment.cashPayment) {
    return debt.totalSale;
  }

  if (debt.payment === Payment.PaymentInInstallments && debt.installments) {
    const remainingAmount = debt.installments
      .filter((inst) => inst.status !== StatusDebtor.paid)
      .reduce((acc, currentInst) => acc + currentInst.price, 0);
    return remainingAmount;
  }

  return 0;
};




export const getDebtorsSummary = (debtors: Debtors[]): DebtorsSummary => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Usamos um Set para contar clientes únicos com dívidas
  const debtorClientIds = new Set<string>();

  let totalToReceive = 0;
  let totalOverdue = 0;
  let salesThisMonth = 0;

  // Percorremos a lista de dívidas UMA ÚNICA VEZ
  for (const debt of debtors) {
    // 1. Calcula o Total a Receber (apenas de dívidas não pagas)
    const owedForThisDebt = calculateTotalOwedForDebt(debt);
    if (owedForThisDebt > 0) {
      totalToReceive += owedForThisDebt;
      // Adiciona o ID do cliente ao Set. O Set garante que não haverá duplicatas.
      debtorClientIds.add(debt.clientId);
    }

    // 2. Calcula o Total em Atraso
    totalOverdue += calculateOverdueAmount(debt, today);

    // 3. Calcula as Vendas do Mês (baseado na data de criação da dívida)
    const debtCreationDate = debt.createdAt;
    if (
      debtCreationDate.getMonth() === currentMonth &&
      debtCreationDate.getFullYear() === currentYear
    ) {
      salesThisMonth += debt.totalSale;
    }
  }

  return {
    totalToReceive,
    totalOverdue,
    salesThisMonth,
    debtorClientsCount: debtorClientIds.size, // O tamanho do Set é o número de clientes devedores únicos
  };
};