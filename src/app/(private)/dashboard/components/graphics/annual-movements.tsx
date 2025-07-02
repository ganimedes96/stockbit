"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMetricsMovements } from "@/domain/metrics/queries";
import { User } from "@/domain/user/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, LineChartIcon, TrendingUp } from "lucide-react";


interface MovementData {
  user: User;
}


export function AnnualMovements({ user }: MovementData) {
  // 1. Estados para interatividade: ano e tipo de gráfico

  const [activeTab, setActiveTab] = useState("bar");
  const year = new Date().getFullYear()
  // 2. Busca de dados agora é dinâmica com base no ano selecionado
  const { data: movementData, isLoading } = useGetMetricsMovements(
    user.company.id,
    year
  );

  // 3. Configuração do gráfico para cores e legendas consistentes
  const chartConfig = {
    in: {
      label: "Entradas",
      color: "#22c55e", // Verde
    },
    out: {
      label: "Saídas",
      color: "#f43f5e", // Vermelho
    },
  } satisfies ChartConfig;

  // 4. Lógica de resumo para o rodapé dinâmico
  const summary = useMemo(() => {
    if (!movementData || movementData.length === 0) return null;

    const netVariations = movementData.map((month) => ({
      name: month.name,
      net: month.in - month.out,
    }));

    const bestMonth = netVariations.reduce((max, current) =>
      current.net > max.net ? current : max
    );

    return { bestMonth };
  }, [movementData]);

  if (isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Movimentações por Mês</CardTitle>
          <CardDescription>
            Entradas e saídas de produtos para o ano de {year}
          </CardDescription>
        </div>

        {/* 5. Controles na UI: Seletor de Ano e Abas (Tabs) para o tipo de gráfico */}
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-2">
            <TabsList>
              <TabsTrigger value="bar">
                <BarChart2 className="h-4 w-4 mr-2" />
                Barras
              </TabsTrigger>
              <TabsTrigger value="line">
                <LineChartIcon className="h-4 w-4 mr-2" />
                Linhas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        {movementData?.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Nenhuma movimentação encontrada para o ano de {year}.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            {/* 6. Renderização condicional do BarChart ou LineChart */}
            {activeTab === "bar" ? (
              <BarChart data={movementData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend />
                <Bar dataKey="in" fill="var(--color-in)" radius={4} />
                <Bar dataKey="out" fill="var(--color-out)" radius={4} />
              </BarChart>
            ) : (
              <LineChart data={movementData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend />
                <Line
                  type="monotone"
                  dataKey="in"
                  stroke="var(--color-in)"
                  strokeWidth={2}
                  dot={true}
                />
                <Line
                  type="monotone"
                  dataKey="out"
                  stroke="var(--color-out)"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="w-full  flex items-center justify-center gap-2 font-medium leading-none">
          {summary?.bestMonth && summary.bestMonth.net > 0 && (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />O mês com maior
              variação positiva foi {summary.bestMonth.name}, com um saldo de +
              {summary.bestMonth.net} unidades.
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
