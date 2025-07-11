"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes e Ícones
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/text/format";
import { PaymentMethodOrder } from "@/domain/orders/types";
import { CreditCard, QrCode, CircleDollarSign, Loader2 } from "lucide-react";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";

// 1. Schema de validação para o formulário do modal
const paymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethodOrder, {
    required_error: "Selecione um método de pagamento.",
  }),
  amountReceived: z.coerce.number().optional(), // Coerce converte string vazia para 0
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// 2. Opções de pagamento para o seletor visual
const paymentOptions = [
  { id: PaymentMethodOrder.pix, name: "Pix", icon: QrCode },
  {
    id: PaymentMethodOrder.creditCard,
    name: "Cartão de Crédito",
    icon: CreditCard,
  },
  {
    id: PaymentMethodOrder.debitCard,
    name: "Cartão de Débito",
    icon: CreditCard,
  },
  { id: PaymentMethodOrder.cash, name: "Dinheiro", icon: CircleDollarSign },
];

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (paymentMethod: PaymentMethodOrder) => void;
  isSubmitting: boolean;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
  isSubmitting,
}: PaymentConfirmationModalProps) {
  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: PaymentMethodOrder.pix, // Deixa Pix como padrão
      amountReceived: 0,
    },
  });

  const { control, watch, handleSubmit, reset } = methods;

  // Observa as mudanças nos campos para re-calcular o troco
  const selectedPaymentMethod = watch("paymentMethod");
  const amountReceived = watch("amountReceived");

  // Calcula o troco
  const change =
    amountReceived && amountReceived > totalAmount
      ? amountReceived - totalAmount
      : 0;

  // Reseta o formulário quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: PaymentFormValues) => {
    onConfirm(data.paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Finalizar Venda</DialogTitle>
          <DialogDescription>
            Selecione o método de pagamento para concluir.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="text-center bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <ControlledSelect<PaymentFormValues>
              control={control}
              name="paymentMethod"
              label="Método de Pagamento"
              options={paymentOptions}
              placeholder="Selecione um método de pagamento"
            />

            {/* Campo condicional para pagamento em dinheiro */}
            {selectedPaymentMethod === PaymentMethodOrder.cash && (
              <div className="space-y-4 p-4 border rounded-lg animate-in fade-in-50">
                <div className="space-y-2">
                  <Label htmlFor="amountReceived">Valor Recebido</Label>
                  <Input
                    {...methods.register("amountReceived")}
                    id="amountReceived"
                    type="number"
                    placeholder="Ex: 50.00"
                    className="text-lg h-12"
                  />
                </div>
                {(amountReceived ?? 0) > 0 && (
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                      Troco
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {formatCurrency(change)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-40" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar Pagamento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
