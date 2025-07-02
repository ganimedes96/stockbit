"use client";

import { useFormContext } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { ControlledRadioGroup } from "@/components/form/controllers/controlled-radio-group"; // Importe seu componente

import { CheckoutFormValues } from "./schema";
import { PaymentMethodOrder } from "@/domain/orders/types";
import { CircleDollarSign, CreditCard, QrCode } from "lucide-react";

// Os dados para as opções do RadioGroup
const paymentOptions = [
  {
    value: PaymentMethodOrder.creditCard,
    label: "Cartão de Crédito",
    icon: CreditCard,
  },
  {
    value: PaymentMethodOrder.debitCard,
    label: "Cartão de Débito",
    icon: CreditCard,
  },
  { value: PaymentMethodOrder.pix, label: "Pix", icon: QrCode },
  { value: PaymentMethodOrder.cash, label: "Dinheiro", icon: CircleDollarSign },
];



export function PaymentStep() {
  // Pegamos apenas o 'control' do formulário pai (CheckoutWizard)
  const { control } = useFormContext<CheckoutFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Método de Pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Selecione como o cliente efetuará o pagamento.
        </p>
      </div>
      <Separator />

      {/* Usamos o seu componente controlado, passando as props necessárias */}
      <ControlledRadioGroup
        control={control}
        displayAs="card" // Ou 'radio', dependendo de como você quer exibir
        name="paymentMethod" // O nome do campo no seu Zod Schema
        label="Escolha uma opção: *"
        options={paymentOptions}
      />
    </div>
  );
}
