"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import {
  useRealtimeOrders,
  useUpdatOrderStatus,
} from "@/domain/orders/queries";
import { Order, OrderOrigin, OrderStatus } from "@/domain/orders/types";
import { User } from "@/domain/user/types";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/utils/text/format";

import { Separator } from "@/components/ui/separator";
import { TableSkeleton } from "./loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderDetailsModal } from "./order-details.modal";
import { useGetNeighborhoods } from "@/domain/neighborhoods/queries";
import { CopyLink } from "@/components/ui/copy-link";
import { MobileOrderCard } from "./mobile-order-card";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Dicionário de status atualizado com label, classes de cor e ícones
export const orderStatusMap: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  [OrderStatus.Prepping]: {
    label: "Preparando",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  [OrderStatus.Shipped]: {
    label: "Enviado",
    color: "bg-orange-100 text-orange-800",
    icon: Truck,
  },
  [OrderStatus.Delivered]: {
    label: "Entregue",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  [OrderStatus.Cancelled]: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  [OrderStatus.Refunded]: {
    label: "Reembolsado",
    color: "bg-gray-200 text-gray-800",
    icon: AlertCircle,
  },
  [OrderStatus.Pending]: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Calendar,
  },
  [OrderStatus.Confirmed]: {
    label: "Confirmado",
    color: "bg-cyan-100 text-cyan-800",
    icon: CheckCircle,
  },
  [OrderStatus.completed]: {
    label: "Finalizado",
    color: "bg-green-200 text-green-900",
    icon: CheckCircle,
  },
};

interface OrderProps {
  user: User;
}
type ConfirmationState = {
  orderId: string;
  orderNumber: string;
  newStatus: OrderStatus;
  newStatusLabel: string;
} | null;

export function OrdersList({ user }: OrderProps) {
  const [selectStatus, setSelectStatus] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState>(null);

    const { data: neighborhoods } = useGetNeighborhoods(user.company.id);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: filteredOrders, isLoading } = useRealtimeOrders(
    user.company.id,
    {
      status: selectStatus,
      search: debouncedSearchTerm,
    }
  );

  const { mutate, isPending } = useUpdatOrderStatus(user.company.id);

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    // Não faz nada se o status já for o mesmo
    if (order.status === newStatus) return;

    setConfirmationState({
      orderId: order.id,
      orderNumber: order.orderNumber || "",
      newStatus: newStatus,
      newStatusLabel: orderStatusMap[newStatus].label,
    });
  };

  const handleConfirmStatusUpdate = () => {
    if (!confirmationState) return;

    mutate(
      {
        orderId: confirmationState.orderId,
        status: confirmationState.newStatus,
      },
      {
        onSuccess: () => {
          setConfirmationState(null); // Fecha o modal no sucesso
        },
        onError: () => {
          setConfirmationState(null); // Fecha o modal no erro também
        },
      }
    );
  };

  return (
    <>
      <div className="p-6">
        <Card className="hidden md:block">
          <CardHeader className="flex  sm:flex-row flex-col w-full items-center justify-between  pb-6">
            <div className="flex flex-col items-start justify-center">
              <CardTitle>Lista de Pedidos</CardTitle>
              <CardDescription>
                Gerencie todos os pedidos realizados no sistema.
              </CardDescription>
            </div>
            <CopyLink
              available={user?.isTrial || user?.subscription.isSubscribed}
              pathname={`catalog/${user.company.slug}`}
              title="Copiar link do catálogo"
            />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                iconPosition="left"
                placeholder="Buscar por nº do pedido, cliente ou e-mail..."
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
                  {Object.entries(orderStatusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
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
                        <TableSkeleton columns={6} rows={10} />
                      ) : (filteredOrders ?? []).length > 0 ? (
                        (filteredOrders ?? []).filter((order: Order) => order.origin === OrderOrigin.Catalog).map((order: Order) => {
                          const statusInfo = orderStatusMap[
                            order.status as OrderStatus
                          ] || {
                            label: "Desconhecido",
                            color: "bg-gray-100 text-gray-800",
                            icon: AlertCircle,
                          };
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
                                  className={`font-semibold ${statusInfo.color}`}
                                >
                                  <statusInfo.icon className="w-3 h-3 mr-2" />
                                  {statusInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {formatCurrency(order.total)}
                              </TableCell>
                              <TableCell className="gap-2 flex flex-row items-center justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Select
                                  value={order.status}
                                  onValueChange={(newStatus) =>
                                    handleStatusChange(
                                      order,
                                      newStatus as OrderStatus
                                    )
                                  }
                                  disabled={isPending}
                                >
                                  <SelectTrigger className=" h-9 ">
                                    <SelectValue placeholder="Alterar status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(orderStatusMap).map(
                                      ([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                          {value.label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
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
        <div className="block md:hidden space-y-4 ">
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pedidos</h2>
                <CopyLink
              available={user?.isTrial || user?.subscription.isSubscribed}
              pathname={`catalog/${user.company.slug}`}
              title="Link do catálogo "
            />      
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              iconPosition="left"
              placeholder="Buscar por nº do pedido, cliente ou e-mail..."
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
                {Object.entries(orderStatusMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              // Você pode criar um skeleton específico para o card mobile ou usar um genérico
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onViewDetails={setSelectedOrder}
                  isPending={isPending}
                />
              ))
            ) : (
              <div className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Package className="mx-auto mb-2 h-8 w-8" />
                Nenhum pedido encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertDialog
        open={!!confirmationState}
        onOpenChange={() => setConfirmationState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração de Status?</AlertDialogTitle>
            <AlertDialogDescription>
              {`
              Você tem certeza que deseja alterar o status do pedido ${confirmationState?.orderNumber} para ${confirmationState?.newStatusLabel} ?
              `}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusUpdate}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Alterando...
                </>
              ) : (
                "Sim, alterar status"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderDetailsModal
        neighborhoods={neighborhoods ?? []}
        order={selectedOrder}
        open={!!selectedOrder}
        setOpen={() => setSelectedOrder(null)}
      />
    </>
  );
}
