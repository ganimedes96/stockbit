"use client";

import { formatCurrency } from "@/utils/text/format";

import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  QrCode,
} from "lucide-react";
import { SimpleMetric } from "@/app/(private)/dashboard/components/overview/simple-metric";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesByHourChart } from "./sales-by-hour-chart";
import { DailySummary } from "@/domain/orders/types";
import { CashSessionStatus, ClosingInput } from "@/domain/cash-closing/types";

interface OverviewData {
  summary: DailySummary | undefined;
  isLoadingSummary: boolean;
  openSession?: ClosingInput | undefined;
}

export function OverviewDebtors({
  summary,
  isLoadingSummary,
  openSession,
}: OverviewData) {
  const isLoading = isLoadingSummary;

  // 3. Lógica para determinar o status do caixa e as mensagens
 const caixaStatus = useMemo(() => {
  // Se não há sessão ou está carregando, retorna um estado padrão
  if (!openSession) {
    return {
      value: "Indisponível",
      description: "Nenhuma sessão encontrada",
    };
  }

  // Se a sessão mais recente estiver ABERTA
  if (openSession.status === CashSessionStatus.OPEN) {
    return {
      value: "Aberto",
      description: `Operando desde ${format(
        openSession.startingOpen,
        "HH:mm"
      )}`,
    };
  }

  // Se a sessão foi REABERTA
  if (openSession.status === CashSessionStatus.REOPENED) {
    return {
      value: "Reaberto",
      description: `Reaberto às ${format(
        openSession.startingOpen,
        "HH:mm"
      )} e em operação`,
    };
  }

  // Se a sessão mais recente estiver FECHADA
  if (
    openSession.status === CashSessionStatus.FINALIZED &&
    openSession.closingDate
  ) {
    const startTime = format(openSession.startingOpen, "HH:mm");
    const endTime = format(openSession.closingDate, "HH:mm");
    return {
      value: `${startTime} - ${endTime}`,
      description: "Horário de funcionamento",
    };
  }

  // Fallback para qualquer outro caso
  return {
    value: "Fechado",
    description: "Aguardando abertura",
  };
}, [openSession]);

  const chartHours = useMemo(() => {
    const defaultHours = { startHour: 8, endHour: 22 }; // Horário padrão se não houver vendas

    if (
      !summary?.salesByHour ||
      Object.keys(summary.salesByHour).length === 0
    ) {
      return defaultHours;
    }

    // Pega todas as horas que tiveram vendas (ex: ["09", "14", "18"])
    const salesHours = Object.keys(summary.salesByHour).map(Number);

    // Encontra a menor e a maior hora
    const minHour = Math.min(...salesHours);
    const maxHour = Math.max(...salesHours);

    // Retorna o intervalo, garantindo um mínimo de visualização (ex: se só houve venda às 14h, mostra de 13h às 15h)
    return {
      startHour: Math.max(0, minHour), // Começa uma hora antes
      endHour: Math.min(23, maxHour), // Termina uma hora depois
    };
  }, [summary]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SimpleMetric
          title="Total de Vendas"
          value={isLoading ? "..." : summary?.totalSalesCount ?? 0}
          description={`${summary?.totalItemsSold} itens vendidos`}
          icon={TrendingUp}
        />

        <SimpleMetric
          title="Faturamento Total"
          value={isLoading ? "..." : formatCurrency(summary?.totalRevenue)}
          description={`Ticket médio: ${formatCurrency(
            summary?.averageTicket
          )}`}
          icon={DollarSign}
        />

        <SimpleMetric
          title="Maior Venda"
          value={isLoading ? "..." : formatCurrency(summary?.highestSaleValue)}
          description={`Menor: ${formatCurrency(summary?.lowestSaleValue)}`}
          icon={TrendingUp}
        />

        <SimpleMetric
          title="Período Ativo"
          value={caixaStatus.value}
          description={caixaStatus.description}
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dinheiro</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.salesByPaymentMethod.cash?.total ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.salesByPaymentMethod.cash?.count} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartão</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                (summary?.salesByPaymentMethod.creditCard?.total ?? 0) +
                  (summary?.salesByPaymentMethod.debitCard?.total ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {(summary?.salesByPaymentMethod.creditCard?.count ?? 0) +
                (summary?.salesByPaymentMethod.debitCard?.count ?? 0)}{" "}
              transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PIX</CardTitle>
            <QrCode className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary?.salesByPaymentMethod.pix?.total ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.salesByPaymentMethod.pix?.count} transações
            </p>
          </CardContent>
        </Card>
      </div>
      <SalesByHourChart
        salesData={summary?.salesByHour || {}}
        startHour={chartHours.startHour}
        endHour={chartHours.endHour}
      />
    </>
  );
}
