"use client";

import { User } from "@/domain/user/types";
import { formatCurrency } from "@/utils/text/format";
import { useGetDebtors } from "@/domain/debtors/queries";
import { getDebtorsSummary } from "./helpers";
import { useMemo } from "react";
import { DollarSign, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { SimpleMetric } from "../../dashboard/components/overview/simple-metric";

interface OverviewData {
  user: User;
}

export function OverviewDebtors({ user }: OverviewData) {
  const { data: debtors, isLoading } = useGetDebtors(user.company.id);

  const summary = useMemo(() => {
    if (!debtors) {
      return {
        totalToReceive: 0,
        totalOverdue: 0,
        debtorClientsCount: 0,
        salesThisMonth: 0,
      };
    }
    return getDebtorsSummary(debtors);
  }, [debtors]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SimpleMetric
        title="Total a Receber"
        value={isLoading ? "..." : formatCurrency(summary.totalToReceive)}
        description="Valor de todas as dívidas ativas"
        icon={DollarSign}
      />

      <SimpleMetric
        title="Valor em Atraso"
        value={isLoading ? "..." : formatCurrency(summary.totalOverdue)}
        description="Soma das parcelas/dívidas vencidas"
        icon={AlertTriangle}
      />

      <SimpleMetric
        title="Clientes Devedores"
        value={isLoading ? "..." : summary.debtorClientsCount}
        description="Total de clientes com saldo devedor"
        icon={Users}
      />

      <SimpleMetric
        title="Vendas a Prazo (Mês)"
        value={isLoading ? "..." : formatCurrency(summary.salesThisMonth)}
        description="Total vendido a prazo neste mês"
        icon={TrendingUp}
      />
    </div>
  );
}
