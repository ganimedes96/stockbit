"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useGetTopProductsInStockValue } from "@/domain/metrics/queries";
import { User } from "@/domain/user/types";

interface TopProductsInStockValueProps {
  user: User;
}

export function TopProductsInStockValue({
  user,
}: TopProductsInStockValueProps) {
  const { data } = useGetTopProductsInStockValue(user.company.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos com Maior Valor em Estoque</CardTitle>
        <CardDescription>
          Produtos que representam maior investimento
        </CardDescription>
      </CardHeader>
      <CardContent>
          <ScrollArea className="h-[500px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Margem</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {data?.length === 0 ? (
                <div className="text-center">Nenhuma informação encontrada</div>
              ) : (
                data?.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{product.stock} un</TableCell>
                    <TableCell>
                      R${" "}
                      {product.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.margin}%</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
      </CardContent>
    </Card>
  );
}
