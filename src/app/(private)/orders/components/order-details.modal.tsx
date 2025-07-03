"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order, PaymentMethodOrder } from "@/domain/orders/types";
import { formatCurrency } from "@/utils/text/format";
import { format } from "date-fns";
import Image from "next/image";
import ImageDefault from "@/assets/default.png"; // Ajuste o caminho para sua imagem padrão
import { orderStatusMap } from "./orders-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ButtonOrden } from "./button-orden";
import {
  generateOrderReceivedMessage,
  generatePickupReadyMessage,
  generateShippedMessage,
} from "./helpers";
import {
  useGetNeighborhoodById,
  useGetNeighborhoods,
} from "@/domain/neighborhoods/queries";
import { useMemo } from "react";
import { Neighborhood } from "@/domain/neighborhoods/types";

// Supondo que você criou um arquivo para o mapa

interface OrderDetailsModalProps {
  neighborhoods: Neighborhood[];
  order: Order | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Objeto para traduzir os métodos de pagamento
const paymentMethodLabels: Record<PaymentMethodOrder, string> = {
  [PaymentMethodOrder.cash]: "Dinheiro",
  [PaymentMethodOrder.pix]: "Pix",
  [PaymentMethodOrder.creditCard]: "Cartão de Crédito",
  [PaymentMethodOrder.debitCard]: "Cartão de Débito",
};

export function OrderDetailsModal({
  neighborhoods,
  order,
  open,
  setOpen,
}: OrderDetailsModalProps) {
  if (!order) return null; // Não renderiza nada se não houver um pedido selecionado

  const statusInfo = orderStatusMap[order.status];

  const selectedNeighborhood = useMemo(() => {
    if (
      !order?.shippingAddress ||
      !order.shippingAddress.neighborhood ||
      !neighborhoods
    ) {
      return null;
    }
    return neighborhoods.find(
      (n) => n.id === order.shippingAddress!.neighborhood
    );
  }, [order, neighborhoods]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Detalhes do Pedido {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Criado em: {format(order.createdAt, "dd/MM/yyyy 'às' HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6 py-4">
            {/* --- Seção de Status e Resumo Rápido --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant="outline"
                    className={`text-base font-semibold ${statusInfo.color}`}
                  >
                    <statusInfo.icon className="mr-2 h-4 w-4" />
                    {statusInfo.label}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Método de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {paymentMethodLabels[order.paymentMethod]}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {formatCurrency(
                      order.total + (selectedNeighborhood?.deliveryFee ?? 0)
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* --- Seção de Cliente e Entrega --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Dados do Cliente</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>
                    <span className="font-medium">
                      Nome: {order.customerName}
                    </span>
                  </p>
                  <p>E-mail: {order.customerEmail || "E-mail não informado"}</p>
                  {order.customerPhone && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-emerald-500"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Notificar via WhatsApp
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>
                          Escolha um template
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <ButtonOrden
                            phone={order.customerPhone}
                            message={generateOrderReceivedMessage(order)}
                          >
                            Confirmar Recebimento
                          </ButtonOrden>
                        </DropdownMenuItem>
                        {order.shippingAddress && (
                          <DropdownMenuItem asChild>
                            <ButtonOrden
                              phone={order.customerPhone}
                              message={generateShippedMessage(order)}
                            >
                              Avisar sobre Entrega
                            </ButtonOrden>
                          </DropdownMenuItem>
                        )}
                        {!order.shippingAddress && (
                          <DropdownMenuItem asChild>
                            <ButtonOrden
                              phone={order.customerPhone}
                              message={generatePickupReadyMessage(order)}
                            >
                              Avisar sobre Retirada
                            </ButtonOrden>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Entrega</h4>
                <div className="space-y-1 text-muted-foreground">
                  {order.shippingAddress ? (
                    <>
                      <p>
                        {order.shippingAddress.street},
                        {order.shippingAddress.number}
                      </p>
                      <p>
                        {selectedNeighborhood?.name || "Bairro não informado"} -{" "}
                        {order.shippingAddress.city}
                        {order.shippingAddress.state?.toUpperCase()}
                      </p>
                      <p>CEP: {order.shippingAddress.zipCode}</p>
                    </>
                  ) : (
                    <p className="font-medium text-primary">Retirada na Loja</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* --- Seção de Itens do Pedido --- */}
            <div>
              <h4 className="font-semibold mb-4">Itens do Pedido</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16"></TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd.</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lineItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Image
                          src={item.photo || ImageDefault}
                          alt={item.productName}
                          width={40}
                          height={40}
                          className="rounded-md object-cover aspect-square"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* <div>
              <h4 className="font-semibold mb-4">Resumo Financeiro</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  {selectedNeighborhood && typeof selectedNeighborhood.deliveryFee === "number" && selectedNeighborhood.deliveryFee > 0 ? (
                    <span className="text-green-600 font-semibold">Grátis</span>
                  ) : (
                    <span>{formatCurrency(selectedNeighborhood?.deliveryFee)}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div> */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
