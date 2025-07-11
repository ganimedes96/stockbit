"use client";
import { useCancelOrderPdv, useRealtimeOrders } from "@/domain/orders/queries";
import { User } from "@/domain/user/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Package, Search, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TableSkeletonPDV } from "./loading-pdv";
import { Order } from "@/domain/orders/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/text/format";
import { Button } from "@/components/ui/button";
import { ModalCancelOrder } from "./modal-cancel-order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
interface ListOrdersProps {
  user: User;
  onSuccess?: () => void;
}

export function ListPdvOrders({ user, onSuccess }: ListOrdersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectStatus, setSelectStatus] = useState("today");
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: filteredOrders, isLoading } = useRealtimeOrders(
    user.company.id,
    {
      status: selectStatus,
      search: debouncedSearchTerm,
    }
  );

  const { mutate, isPending } = useCancelOrderPdv(user.company.id);

  const handleCancelOrder = (orderId: string) => {
    mutate(orderId, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <div className="p-6">
      <Card className="hidden md:block">
        <CardHeader className="flex  sm:flex-row flex-col w-full items-center justify-between  pb-6">
          <div className="flex flex-col items-start justify-center">
            <CardTitle>Lista de vendas</CardTitle>
            <CardDescription>
              Aqui vocês pode visualizar e gerenciar as vendas realizadas.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              iconPosition="left"
              placeholder="Buscar por nº do pedido ou cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectStatus} onValueChange={setSelectStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Pedidos</SelectItem>
                <SelectItem value="today">Pedidos de Hoje</SelectItem>
                <Separator className="my-1" />

                <SelectItem value="cancelled">Pedidos Cancelados</SelectItem>
                <SelectItem value="completed">Vendas Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden md:block">
            <Card>
              <ScrollArea className="border rounded-md h-[500px]">
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-center">Pedido</TableHead>
                      <TableHead className="text-center">Cliente</TableHead>
                      <TableHead className="text-center">Data</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeletonPDV columns={6} rows={10} />
                    ) : (filteredOrders ?? []).length > 0 ? (
                      (filteredOrders ?? [])
                        .filter((order: Order) => order.origin === "pdv")
                        .map((order: Order) => {
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm text-center">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="font-medium">
                                  {order.customerName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.customerEmail}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {format(order.createdAt, "dd/MM/yyyy - HH:mm")}
                              </TableCell>
                              <TableCell className="text-center">
                                {/* 2. Badge atualizado para usar o novo mapa de status */}
                                <Badge
                                  variant="outline"
                                  className={`font-semibold ${
                                    order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {order.status === "completed" ? (
                                    <span className="flex items-center">
                                      <Check className="mr-2 h-3 w-3" />
                                      Finalizado
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <X className="mr-2 h-3 w-3" />
                                      Cancelado
                                    </span>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {formatCurrency(order.total)}
                              </TableCell>
                              <TableCell className="gap-2 flex flex-row items-center justify-center">
                                {order.status !== "cancelled" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setOpenCancelModal(true);
                                    }}
                                    disabled={isPending}
                                  >
                                    Cancelar venda
                                  </Button>
                                )}
                                <ModalCancelOrder
                                  open={openCancelModal}
                                  setOpen={setOpenCancelModal}
                                  handleCancelOrder={() =>
                                    handleCancelOrder(order.id)
                                  }
                                  isPending={isPending}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-48 text-center text-muted-foreground"
                        >
                          <Package className="mx-auto mb-2 h-8 w-8" />
                          Nenhum pedido encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
