"use client";

import { useFormContext } from "react-hook-form";
import { useCart } from "@/providers/cart-context";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/text/format";
import Image from "next/image";
import ImageDefault from "@/assets/default.png";
import { PaymentMethodOrder } from "@/domain/orders/types"; // Importe seus tipos
import { useMemo } from "react";
import { CheckoutFormValues } from "./schema"; // Importe o tipo do seu schema de checkout
import { applyMask, mask } from "@/utils/text/mask";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { User } from "@/domain/user/types";
import { useGetNeighborhoods } from "@/domain/neighborhoods/queries";

// Objeto de mapeamento para os nomes dos métodos de pagamento
const paymentMethodLabels: Record<PaymentMethodOrder, string> = {
  [PaymentMethodOrder.cash]: "Dinheiro",
  [PaymentMethodOrder.pix]: "Pix",
  [PaymentMethodOrder.creditCard]: "Cartão de Crédito",
  [PaymentMethodOrder.debitCard]: "Cartão de Débito",
};

interface ConfirmationStepProps {
  user: User
}

// O componente não precisa mais de props
export function ConfirmationStep({ user }: ConfirmationStepProps) {
  // 1. Acessa os dados do carrinho e do formulário via hooks de contexto.
  const { cart } = useCart();
  // Tipamos o useFormContext para ter autocomplete e segurança
  const { watch } = useFormContext<CheckoutFormValues>();
  
  // 2. "Observamos" os campos preenchidos nos passos anteriores.
  const formData = watch() as CheckoutFormValues;
  const {data: allNeighborhoods } = useGetNeighborhoods(user.company.id);
  // Calcula o resumo financeiro
   const summary = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
    
    let shippingCost = 0;
    let isFreeShipping = false;

    // Só calcula o frete se for entrega e um bairro for selecionado
    if (formData.deliveryMethod === 'delivery' && formData.shippingAddress?.neighborhood && allNeighborhoods) {
      const selectedNeighborhood = allNeighborhoods.find(
        (n) => n.id === formData.shippingAddress.neighborhood
      );

      if (selectedNeighborhood) {
        // Verifica se o pedido atinge o valor para frete grátis
        if (
          selectedNeighborhood.minOrderValueForFreeShipping &&
          subtotal >= selectedNeighborhood.minOrderValueForFreeShipping
        ) {
          shippingCost = 0;
          isFreeShipping = true;
        } else {
          shippingCost = selectedNeighborhood.deliveryFee;
        }
      }
    }
    
    const total = subtotal + shippingCost;
    return { subtotal, shippingCost, total, isFreeShipping };
  }, [cart, formData, allNeighborhoods]);


   const selectedNeighborhoodName = useMemo(() => {
    if (formData.deliveryMethod === 'delivery' && formData.shippingAddress?.neighborhood && allNeighborhoods) {
      return allNeighborhoods.find(n => n.id === formData.shippingAddress.neighborhood)?.name;
    }
    return "";
  }, [formData, allNeighborhoods]);

   if (!formData.deliveryMethod) {
    return (
        <div className="text-center p-8 text-muted-foreground">
            Por favor, volte e selecione um método de entrega.
        </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="text-center">
        <h3 className="text-xl font-bold">Revise seu Pedido</h3>
        <p className="text-sm text-muted-foreground">
          Confira todos os detalhes antes de finalizar.
        </p>
      </div>
      <Separator />

      {/* Seção de Itens do Pedido */}
      <ScrollArea className="max-h-[250px] overflow-y-auto">
      <div className="space-y-3">
        <h4 className="font-semibold">Itens no Carrinho</h4>
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 text-sm">
            <Image
              src={
                typeof item.photo === "string" ||
                typeof item.photo === "undefined"
                  ? item.photo || ImageDefault
                  : ImageDefault
              }
              alt={item.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground">
                {item.quantity} x {formatCurrency(item.salePrice)}
              </p>
            </div>
            <p className="font-semibold">
              {formatCurrency(item.quantity * item.salePrice)}
            </p>
          </div>
        ))}
      </div>
       <ScrollBar orientation="vertical" />
      </ScrollArea>

      <Separator />

      {/* 3. Renderizamos os dados observados diretamente. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h2 className="font-semibold text-md  text-primary mb-2">{formData.deliveryMethod === "delivery" ? "Entrega" : "Retirada"}</h2>
          {formData ? (
            formData.deliveryMethod === "delivery" ? (
              <div className="text-muted-foreground">
                <p className="font-medium text-primary">
                  {formData.shippingAddress && formData.shippingAddress.customerName}
                </p>
                <p>
                   {formData.shippingAddress?.street},{formData.shippingAddress?.number}
                </p>
                <p>
                  {selectedNeighborhoodName} - {formData.shippingAddress?.city},{" "}
                  {formData.shippingAddress?.state.toUpperCase()}
                </p>
                <p>CEP: {formData.shippingAddress?.zipCode}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">
                  {formData.shippingAddress.customerName}   
                </span>
                <span>
                 {applyMask(formData.shippingAddress.customerPhone,mask.phoneMobile)}
                </span>
                <p className="text-muted-foreground">Retirar na loja física.</p>
              </div>
            )
          ) : (
            <p className="text-destructive">Endereço não preenchido.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Pagamento</h4>
          <p className="text-muted-foreground">
            {formData.paymentMethod
              ? paymentMethodLabels[formData.paymentMethod]
              : "Não selecionado"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Resumo Financeiro */}
       <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Frete</span>
          {/* Mostra "Grátis" ou o valor da taxa */}
          {summary.isFreeShipping ? (
            <span className="text-green-600 font-semibold">Grátis</span>
          ) : (
            <span>{formatCurrency(summary.shippingCost)}</span>
          )}
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Total</span>
          <span>{formatCurrency(summary.total)}</span>
        </div>
      </div>
    </div>
  );
}
