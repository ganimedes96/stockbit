"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useGetMetricsByCategory } from "@/domain/metrics/queries";
import { User } from "@/domain/user/types";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DistributionByCategoryProps {
  user: User;
}

export function DistributionByCategory({ user }: DistributionByCategoryProps) {
  const { data: distributionCategories } = useGetMetricsByCategory(
    user.company.id
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
        <CardDescription>Percentual de produtos por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        {distributionCategories?.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Nenhuma informação encontrada.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionCategories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {distributionCategories?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
