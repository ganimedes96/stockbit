"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMovementList,
  useMovementsFilter,
} from "@/domain/movements/queries";
import { StockMovementType } from "@/domain/movements/types";
import { useProductList } from "@/domain/product/queries";
import { User } from "@/domain/user/types";
import { format } from "date-fns";
import {
  Calendar,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { HistoryMovimentsSkeleton } from "./loading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HistoryMovimentsProps {
  companyId: string;
  user: User;
}

export function HistoryMoviments({ companyId, user }: HistoryMovimentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectStatus, setSelectStatus] = useState("all");
  const [selectPeriod, setSelectPeriod] = useState<"month" | "day">("month");

  const { data: movements, isLoading: isLoadingMoviments } =
    useMovementList(companyId);

    console.log(selectPeriod);
    
  const { data: filteredMovimentsData } = useMovementsFilter(companyId,{
    date: new Date(),
    period: selectPeriod,
  }) 
  

  const { data: products , isLoading:isLoadingProducts } =
    useProductList(companyId);

  const getProduct = (productId: string) =>
    products?.find((p) => p.id === productId);

  const filteredMoviments = movements?.filter((movement) => {
    const product = getProduct(movement.productId);
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      product?.name?.toLowerCase().includes(search) ||
      product?.sku?.toLowerCase().includes(search);

    const matchesStatus =
      selectStatus === "all" || movement.type === selectStatus;

    return matchesSearch && matchesStatus;
  });

  const STOCK_IN =
    filteredMovimentsData
      ?.filter(
        (moviment) => moviment.type === StockMovementType.STOCK_IN
      )
      .reduce((acc, moviment) => acc + moviment.quantity, 0) ?? 0;

  const STOCK_OUT =
    filteredMovimentsData
      ?.filter(
        (moviment) => moviment.type === StockMovementType.STOCK_OUT
      )
      .reduce((acc, moviment) => acc + moviment.quantity, 0) ?? 0;
                
  if (isLoadingMoviments || isLoadingProducts) {
    return <HistoryMovimentsSkeleton />;
  }
  return (
    <div className="flex flex-col  mx-6 mb-6">
      <Tabs
        className="flex flex-row items-center justify-end mb-6"
        defaultValue="bar"
        value={selectPeriod}
        onValueChange={(value) => setSelectPeriod(value as "month" | "day")}
      >
        <TabsList className="flex flex-row items-center gap-2">
          <TabsTrigger value="day">Dia</TabsTrigger>
          <TabsTrigger value="month">Mês</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Entradas ${selectPeriod === "day" ? "Hoje" : "do mês"}`}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +
              {STOCK_IN}
            </div>
            <p className="text-xs text-muted-foreground">
              unidades adicionadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Saidas ${selectPeriod === "day" ? "Hoje" : "do mês"}`}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{STOCK_OUT}</div>
            <p className="text-xs text-muted-foreground">unidades removidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Variação ${selectPeriod === "day" ? "Hoje" : "do mês"}`}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                STOCK_IN - STOCK_OUT >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {STOCK_IN - STOCK_OUT >= 0 ? "+" : ""}
              {STOCK_IN - STOCK_OUT}
            </div>
            <p className="text-xs text-muted-foreground">variação líquida</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            Todas as entradas e saídas de produtos registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              iconPosition="left"
              placeholder="Buscar por produto ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select value={selectStatus} onValueChange={setSelectStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value={StockMovementType.STOCK_IN}>
                  Apenas Entradas
                </SelectItem>
                <SelectItem value={StockMovementType.STOCK_OUT}>
                  Apenas Saídas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
           <ScrollArea className="max-h-[600px] overflow-auto">
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMoviments?.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-mono text-sm">
                    {format(movement.createdAt, "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {
                          products?.find((p) => p.id === movement.productId)
                            ?.name
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU:{" "}
                        {
                          products?.find((p) => p.id === movement.productId)
                            ?.sku
                        }
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        movement.type === StockMovementType.STOCK_IN
                          ? "default"
                          : "secondary"
                      }
                      className={
                        movement.type === StockMovementType.STOCK_IN
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {movement.type === StockMovementType.STOCK_IN ? (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Entrada
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Saída
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        movement.type === StockMovementType.STOCK_IN
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {movement.type === StockMovementType.STOCK_IN ? "+" : "-"}
                      {movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {movement.description || "Nenhuma observação"}
                  </TableCell>
                  <TableCell>{movement.responsible  || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            <ScrollBar orientation="vertical"/>
           </ScrollArea>
          {filteredMoviments?.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma movimentação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
