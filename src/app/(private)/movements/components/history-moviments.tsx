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
import { useMovementsFilter } from "@/domain/movements/queries";
import { StockMovementType } from "@/domain/movements/types";
import { User } from "@/domain/user/types";
import { format } from "date-fns";
import {
  Calendar,
  Package,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { HistoryMovimentsSkeleton } from "./loading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { FormMovement } from "./form-movement";
import { Button } from "@/components/ui/button";

interface HistoryMovimentsProps {
  user: User;
}

export function HistoryMoviments({ user }: HistoryMovimentsProps) {
  const [selectStatus, setSelectStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectPeriod, setSelectPeriod] = useState<"month" | "day">("month");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: movements, isLoading: isLoadingMoviments } = useMovementsFilter(
    user.company.id,
    selectPeriod
  );

  // 2. O useMemo agora é muito mais simples e eficiente.
  const { filteredMovements, summaryIn, summaryOut } = useMemo(() => {
    if (!movements) {
      return { filteredMovements: [], summaryIn: 0, summaryOut: 0 };
    }

    // Os cálculos de resumo continuam os mesmos
    const summaryIn = movements
      .filter((m) => m.type === StockMovementType.STOCK_IN)
      .reduce((acc, m) => acc + m.quantity, 0);
    const summaryOut = movements
      .filter((m) => m.type === StockMovementType.STOCK_OUT)
      .reduce((acc, m) => acc + m.quantity, 0);

    // A lógica de filtro agora usa os dados da própria movimentação.
    const filteredMovements = movements.filter((movement) => {
      const search = debouncedSearchTerm.toLowerCase();

      // Busca diretamente nos campos denormalizados do documento de movimentação.
      const matchesSearch =
        movement.productName?.toLowerCase().includes(search) ||
        movement.sku?.toLowerCase().includes(search);

      const matchesStatus =
        selectStatus === "all" || movement.type === selectStatus;

      return matchesSearch && matchesStatus;
    });

    return { filteredMovements, summaryIn, summaryOut };
  }, [movements, debouncedSearchTerm, selectStatus]);

  if (isLoadingMoviments) {
    return <HistoryMovimentsSkeleton />;
  }
  return (
    <div className="flex flex-col  m-6">
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
            <CardTitle className="text-sm font-medium">{`Entradas ${
              selectPeriod === "day" ? "Hoje" : "do mês"
            }`}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{summaryIn}
            </div>
            <p className="text-xs text-muted-foreground">
              unidades adicionadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Saidas ${
              selectPeriod === "day" ? "Hoje" : "do mês"
            }`}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{summaryOut}</div>
            <p className="text-xs text-muted-foreground">unidades removidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Variação ${
              selectPeriod === "day" ? "Hoje" : "do mês"
            }`}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summaryIn - summaryOut >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summaryIn - summaryOut >= 0 ? "+" : ""}
              {summaryIn - summaryOut}
            </div>
            <p className="text-xs text-muted-foreground">variação líquida</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-end justify-between gap-4">
          <div>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              Todas as entradas e saídas de produtos registradas no sistema
            </CardDescription>
          </div>
          <FormSheet
            title="Nova Movimentação"
            description="Registre uma entrada ou saída de produtos no estoque"
            formComponent={FormMovement}
            formProps={{ user }}
            customButton={
              <Button variant="default" size="sm">
                <Plus size={35} />
                Registrar movimentação
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              iconPosition="left"
              placeholder="Buscar por produto ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <ScrollArea className="max-h-[500px] w-full overflow-auto mt-4">
            <div className="min-w-[900px]">
              <Table className="mt-6">
                <TableHeader className="bg-sidebar">
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Motivo</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements?.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-mono text-sm">
                        {format(movement.createdAt, "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {movement.productName || "Sem nome"}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU:
                            {movement.sku || "Sem SKU"}
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
                      <TableCell className="text-center">
                        <span
                          className={`font-medium ${
                            movement.type === StockMovementType.STOCK_IN
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {movement.type === StockMovementType.STOCK_IN
                            ? "+"
                            : "-"}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{movement.reason}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {movement.description || "Nenhuma observação"}
                      </TableCell>
                      <TableCell className="text-center">{movement.responsible || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
          {filteredMovements?.length === 0 && (
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
