"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DailySummary, Order, PaymentMethodOrder } from "@/domain/orders/types";
import { User } from "@/domain/user/types";
import { formatCurrency } from "@/utils/text/format";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, QrCode } from "lucide-react";

interface DetailedReportModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[]; // Recebe a lista de pedidos pronta
  summary: DailySummary | undefined; // Recebe o resumo pronto
  user: User;
  date: Date;
}

export function DetailedReportModal({
  open,
  date,
  summary,
  onClose,
  orders, // Usa a prop diretamente
  user,
}: DetailedReportModalProps) {
  const orderStatusMap: Record<
    PaymentMethodOrder,
    { label: string; icon: React.ElementType }
  > = {
    [PaymentMethodOrder.pix]: {
      label: "Pix",
      icon: QrCode,
    },
    [PaymentMethodOrder.creditCard]: {
      label: "Cartão de Crédito",
      icon: CreditCard,
    },
    [PaymentMethodOrder.debitCard]: {
      label: "Cartão de Débito",
      icon: CreditCard,
    },
    [PaymentMethodOrder.cash]: {
      label: "Dinheiro",
      icon: DollarSign,
    },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Relatório Detalhado de Vendas</DialogTitle>
          <DialogDescription>
            Exibindo todas as vendas do PDV para o dia{" "}
            {format(date, "dd/MM/yyyy")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div className="space-y-6 pr-6 py-4">
            {/* Cabeçalho do Relatório */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">RELATÓRIO DE VENDAS (PDV)</h2>
              <p className="text-gray-600">Operador: {user.firstName}</p>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {summary?.totalSalesCount ?? 0}
                </div>
                <div className="text-sm text-gray-600">Vendas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {summary?.totalItemsSold ?? 0}
                </div>
                <div className="text-sm text-gray-600">Itens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalRevenue ?? 0)}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div>
              <h3 className="font-bold mb-4">Totais por Forma de Pagamento</h3>
              <div className="space-y-2 text-sm">
                {/* Opcional: Mapear para não repetir código */}
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>
                    💵 Dinheiro ({summary?.salesByPaymentMethod.cash.count ?? 0}{" "}
                    vendas)
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      summary?.salesByPaymentMethod.cash.total ?? 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>
                    💳 Cartão de Crédito (
                    {(summary?.salesByPaymentMethod.creditCard.count ?? 0) 
                     }
                    vendas)
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      (summary?.salesByPaymentMethod.creditCard.total ?? 0) 
                       
                    )}
                  </span>
                  
                </div>
                 <div className="flex justify-between p-2 bg-muted rounded">
                  <span>
                    💳 Cartão de Débito (
                    {(summary?.salesByPaymentMethod.debitCard.count ?? 0) 
                     }
                    vendas)
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      (summary?.salesByPaymentMethod.debitCard.total ?? 0) 
                       
                    )}
                  </span>
                  
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>
                    📱 PIX ({summary?.salesByPaymentMethod.pix.count ?? 0}{" "}
                    vendas)
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      summary?.salesByPaymentMethod.pix.total ?? 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lista de Vendas */}
            <div>
              <h3 className="font-bold mb-4">Lista de Vendas do Dia</h3>
              <div className="border rounded-md">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-200 hover:bg-gray-300">
                      <TableHead className="text-center font-semibold text-black">
                        ID
                      </TableHead>
                      <TableHead className="text-center font-semibold text-black">
                        Horário
                      </TableHead>
                      <TableHead className="text-center font-semibold text-black">
                        Itens
                      </TableHead>
                      <TableHead className="text-center font-semibold text-black">
                        Total
                      </TableHead>
                      <TableHead className="text-center font-semibold text-black">
                        Pagamento
                      </TableHead>
                      <TableHead className="text-center font-semibold text-black">
                        Cliente
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* A prop 'orders' agora é garantidamente um array */}
                    {(orders || [])?.map((sale) => {
                      const paymentMethod =
                        orderStatusMap[
                          sale.paymentMethod as keyof typeof PaymentMethodOrder
                        ];
                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="text-center">
                            {sale.orderNumber}
                          </TableCell>
                          <TableCell className="text-center">
                            {format(sale.createdAt, "HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-center">
                            {sale.lineItems.length}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatCurrency(sale.total)}
                          </TableCell>
                          <TableCell className="text-center flex gap-2 items-center justify-center">
                            {" "}
                            <paymentMethod.icon className="w-3 h-3 " />
                            {paymentMethod.label}
                          </TableCell>
                          <TableCell className="text-center">
                            {sale.customerName || "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
