"use client";
import { User } from "@/domain/user/types";
import { SimpleMetric } from "./simple-metric";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/text/format";
import { useOverview } from "@/domain/metrics/queries";
import { useCategoryList } from "@/domain/category/queries";

interface OverviewData {
  user: User;
}

export function Overview({ user }: OverviewData) {
  const { data } = useOverview(user.company.id);
  const { data: categories } = useCategoryList(user.company.id);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SimpleMetric
        title="Valor Total em Estoque"
        value={formatCurrency(data?.totalValue ?? 0)}
        description="Faturamento do mês"
        icon={DollarSign}
      />
      <SimpleMetric
        title="Total de Produtos"
        value={data?.totalProducts ?? 0}
        description={`Em ${categories?.length ?? 0} categorias`}
        icon={Package}
      />
      <SimpleMetric
        title="Estoque Baixo"
        value={data?.lowStockCount ?? 0}
        description="requerem atenção"
        icon={AlertTriangle}
      />
      <SimpleMetric
        title="Margem Média"
        value={`${data?.averageMargin ?? 0}%`}
        description="lucro sobre custo"
        icon={TrendingUp}
      />
    </div>
  );
}
