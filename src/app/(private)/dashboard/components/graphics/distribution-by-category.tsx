
"use client";
import { useState, useMemo } from "react";
import { Bar, BarChart, PieChart, Pie, Cell, LabelList, YAxis, XAxis } from "recharts";
import { BarChart2, Filter, PieChartIcon, TrendingUp } from "lucide-react";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMetricsByCategory } from "@/domain/metrics/queries";
import { User } from "@/domain/user/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DistributionByCategoryProps {
  user: User;
}

type CategoryData = {
  name: string;   
  value: number;  
  color: string;  
};

interface CustomPieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  fill: string;
  value: number;
  payload: CategoryData; // O payload contém o item de dados original
}

export function DistributionByCategory({ user }: DistributionByCategoryProps) {
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("bar"); // Começa com o gráfico de barras

  const { data, isLoading } = useGetMetricsByCategory(user.company.id);

  const { sortedData, totalValue } = useMemo(() => {
    if (!data?.length) {
      return { sortedData: [], totalValue: 0 };
    }

    const chartData = data as CategoryData[];

    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    const sorted = [...chartData].sort((a, b) =>
      sortOrder === "desc" ? b.value - a.value : a.value - b.value
    );

    return { sortedData: sorted, totalValue: total };
  }, [data, sortOrder]);

  const chartConfig = useMemo(() => {
    if (!sortedData.length) return {};
    
    const config: ChartConfig = {
      value: {
        label: "Produtos",
      },
      ...sortedData.reduce((acc, item) => {
        acc[item.name] = {
          label: item.name,
          color: item.color,
        };
        return acc;
      }, {} as ChartConfig),
    };
    return config;
  }, [sortedData]);
  
  // Função para renderizar os rótulos customizados do gráfico de pizza
  const renderCustomPieLabel = (props: CustomPieLabelProps) => {
    const { cx, cy, midAngle, outerRadius, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    if (percent < 0.03) return null; // Oculta rótulos de fatias muito pequenas

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs font-medium">{`${payload.name}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
                {`${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
        </g>
    );
  };

  if (isLoading) {
    return <Skeleton className="h-[480px] w-full rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>Produtos distribuídos por categoria</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-2">
            <TabsList>
              <TabsTrigger value="bar">
                <BarChart2 className="h-4 w-4 mr-2" />
                Barras
              </TabsTrigger>
              <TabsTrigger value="pie">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Pizza
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                <DropdownMenuRadioItem value="desc">Maior para menor</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">Menor para maior</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Nenhuma informação de categoria encontrada.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-96 w-full">
            {activeTab === "pie" ? (
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(val) => `${val} produtos (${((val as number / totalValue) * 100).toFixed(1)}%)`} />}
                />
                <Pie data={sortedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderCustomPieLabel}>
                  {sortedData.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={sortedData} layout="vertical" margin={{ left: 10, right: 40 }}>
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 12 }} interval={0} />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="line" formatter={(val) => `${val} produtos`}/>} />
                <Bar dataKey="value" layout="vertical" radius={5}>
                  {sortedData.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                  <LabelList dataKey="value" position="right" offset={8} className="fill-foreground text-sm" />
                </Bar>
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="w-full flex flex-row gap-2 items-center justify-center font-medium leading-none">
          {sortedData.length > 0 ? (
            <>
              <TrendingUp className="h-4 w-4 text-primary" />
              A categoria <span className="font-bold" style={{color: sortedData[0].color}}>{sortedData[0].name}</span> lidera, representando{" "}
              <span className="font-bold">{((sortedData[0].value / totalValue) * 100).toFixed(1)}%</span> do total.
            </>
          ) : ( "Nenhum dado para exibir resumo." )}
        </div>
      </CardFooter>
    </Card>
  );
}