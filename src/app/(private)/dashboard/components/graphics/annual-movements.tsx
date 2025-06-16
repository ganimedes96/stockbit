"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGetMetricsMovements } from "@/domain/metrics/queries";
import { User } from "@/domain/user/types";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MovementData {
  user: User;
}

export function AnnualMovements({ user }: MovementData) {
  const { data: movementData } = useGetMetricsMovements(user.company.id, 2025);
  console.log("movementData", movementData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações por Mês</CardTitle>
        <CardDescription>
          Entradas e saídas de produtos por ano
        </CardDescription>
      </CardHeader>
      <CardContent>
        {movementData?.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Nenhuma informação encontrada.
          </div>
        ) : (
          <ScrollArea className="h-full w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={movementData}
                layout="horizontal"
                accessibilityLayer
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="in"
                  fill="#10b981"
                  name="Entradas"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="out"
                  radius={[6, 6, 0, 0]}
                  fill="#ef4444"
                  name="Saídas"
                />
              </BarChart>
            </ResponsiveContainer>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
