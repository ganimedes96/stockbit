"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Debtors,
  Installments,
  PaymentMethod,
  StatusDebtor,
} from "@/domain/debtors/types";
import { formatCurrency } from "@/utils/text/format";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { getInstallmentStatus } from "./helpers"; // Importe a função que criamos
import { Product } from "@/domain/product/types";
import {
  useUpdateDebtStatusCashPayment,
  useUpdateInstallmentStatus,
} from "@/domain/debtors/queries";
import { Button } from "@/components/ui/button";
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

interface DebtCardProps {
  companyId: string;
  debt: Debtors;
  productsList: Product[] | undefined;
  index: number;
}

export function DebtCard({
  debt,
  productsList,
  index,
  companyId,
}: DebtCardProps) {
  const [confirmingInstallment, setConfirmingInstallment] =
    useState<Installments | null>(null);
    
  const [isConfirmingCashPayment, setIsConfirmingCashPayment] = useState(false);
  const summary = useMemo(() => {
    const paidInstallments =
      debt.installments?.filter((inst) => inst.status === StatusDebtor.paid) ||
      [];

    const pendingInstallments =
      debt.installments
        ?.filter((inst) => inst.status !== StatusDebtor.paid)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) || [];

    const amountPaid = paidInstallments.reduce(
      (acc, inst) => acc + inst.price,
      0
    );
    const amountRemaining = debt.totalSale - amountPaid;
    const nextDueDate =
      pendingInstallments.length > 0 ? pendingInstallments[0].dueDate : null;

    return { amountPaid, amountRemaining, nextDueDate };
  }, [debt]);

  const { mutateAsync: updateInstallment, isPending: isUpdatingInstallment } =
    useUpdateInstallmentStatus(companyId);
  const { mutateAsync: updateDebtStatusCashPayment, isPending: isUpdatingCash } =
    useUpdateDebtStatusCashPayment(companyId);



  const handleConfirmPayment = () => {
    if (!confirmingInstallment) return;

    updateInstallment({
      debtId: debt.id,
      installmentNumber: confirmingInstallment.installment,
      newStatus: StatusDebtor.paid,
      clientId: debt.clientId,
    });

    setConfirmingInstallment(null);
  };
  const handleConfirmCashPayment = () => {
    updateDebtStatusCashPayment({
      debtId: debt.id,
      newStatus: StatusDebtor.paid,
      clientId: debt.clientId,
    });
    setIsConfirmingCashPayment(false);
  };

  const getProductName = (productId: string) => {
    return (
      productsList?.find((p) => p.id === productId)?.name ||
      "Produto não encontrado"
    );
  };

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.cash]: "Dinheiro",
    [PaymentMethod.pix]: "Pix",
    [PaymentMethod.creditCard]: "Cartão de Crédito",
    [PaymentMethod.debitCard]: "Cartão de Débito",
    [PaymentMethod.transfer]: "Transferência",
  };

  return (
    <>
      <Card key={debt.id} className="mb-6">
        <CardHeader>
          <div className="flex flex-row items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Venda #{index + 1}</h3>
              <p className="text-sm text-muted-foreground">
                Realizada em: {format(debt.createdAt, "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(debt.totalSale)}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {debt.products.map((p) => (
              <div key={p.productId} className="flex justify-between">
                <span>
                  {getProductName(p.productId)} ({p.quantity}x)
                </span>
                <span>{formatCurrency(p.priceUnit)}</span>
              </div>
            ))}
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Método de Pagamento:</span>
              {/* Busca a tradução no nosso objeto. Se não encontrar, usa "Não informado". */}
              <span className="font-medium text-primary">
                {debt.paymentMethod ? paymentMethodLabels[debt.paymentMethod] : "Não informado"}
              </span>
            </div>
          </div>
        </CardHeader>
        <Separator orientation="horizontal" className="my-2" />
        <CardContent>
          <h3 className="mb-4 text-md font-semibold">Parcelas</h3>
          <div className="space-y-3">
            {debt.installments?.map((inst) => {
              const statusInfo = getInstallmentStatus(inst);
              return (
                <div
                  key={inst.installment}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {inst.installment}ª Venc:{" "}
                    {format(inst.dueDate, "dd/MM/yyyy")}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">
                      {formatCurrency(inst.price)}
                    </span>
                    <Badge
                      variant={statusInfo.variant}
                      className="w-24 justify-center"
                    >
                      {statusInfo.text}
                    </Badge>
                    {statusInfo.text !== "Pago" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmingInstallment(inst)}
                        disabled={isUpdatingInstallment} // Desabilita enquanto a mutação está em andamento
                      >
                        {isUpdatingInstallment ? "Pagando..." : "Pagar"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <Separator orientation="horizontal" className="my-2" />
        <CardFooter className="grid grid-cols-3 gap-4 text-sm pt-4">
          <div className="text-green-600">
            <p className="font-semibold">Pago</p>
            <p>{formatCurrency(summary.amountPaid)}</p>
          </div>
          <div className="text-orange-500">
            <p className="font-semibold">Restante</p>
            <p>{formatCurrency(summary.amountRemaining)}</p>
          </div>
          <div>
            <p className="font-semibold">Próximo Venc.</p>
            <p>
              {summary.nextDueDate
                ? format(summary.nextDueDate, "dd/MM/yyyy")
                : "N/A"}
            </p>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog
        open={!!confirmingInstallment}
        onOpenChange={() => setConfirmingInstallment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja marcar a{" "}
              <strong>{confirmingInstallment?.installment}ª parcela</strong> no
              valor de{" "}
              <strong>
                {formatCurrency(confirmingInstallment?.price ?? 0)}
              </strong>{" "}
              como paga?
              <br />
              Esta ação não poderá ser desfeita facilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* O botão de cancelar já fecha o modal por padrão */}
            <AlertDialogCancel disabled={isUpdatingInstallment}>Cancelar</AlertDialogCancel>

            {/* O botão de ação agora chama a função que executa a mutação */}
            <AlertDialogAction
              onClick={handleConfirmPayment}
              disabled={isUpdatingInstallment}
            >
              {isUpdatingInstallment ? "Confirmando..." : "Confirmar Pagamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Modal de Confirmação para DÍVIDA À VISTA */}
      <AlertDialog
        open={isConfirmingCashPayment}
        onOpenChange={() => setIsConfirmingCashPayment(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento da Dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso marcará a dívida inteira no valor de{" "}
              <strong>{formatCurrency(debt.totalSale)}</strong> como paga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingCash}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCashPayment}
              disabled={isUpdatingCash}
            >
              {isUpdatingCash ? "Confirmando..." : "Sim, confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
