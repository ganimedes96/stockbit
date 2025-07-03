"use client";

import { forwardRef, useRef, useState } from "react";
import { Step } from "@/components/form/containers/step-progress-bar";
import { useCreateOrder } from "@/domain/orders/queries";
import { MapIcon, ShoppingBag, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-context";
import { User } from "@/domain/user/types";
import { toast } from "sonner";

import { CartProductsList } from "./cart-products-list";
import { AddressStep } from "./address";
import { PaymentStep } from "./payment";
import { ConfirmationStep } from "./confirmation";

import { CheckoutFormValues } from "./schema";
import {
  OrderInput,
  OrderStatus,
  LineItem,
  ShippingAddress,
  PaymentMethodOrder,
} from "@/domain/orders/types";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { GlobalFormSheet } from "@/components/form/containers/global-form-sheet";
import { ThankYouModal } from "../thank-you-modal";

interface RegisterOrderProps {
  user: User;
}

const CartButton = forwardRef<HTMLButtonElement>((props, ref) => {
  const { totalCartItems, isCartHydrated } = useCart();
  return (
    <div className="relative">
      <Button
        ref={ref}
        {...props}
        size="icon"
        variant={"outline"}
        className="relative"
      >
        <ShoppingBag className="h-6 w-6" />
        {isCartHydrated && totalCartItems > 0 && (
          <span
            key={totalCartItems}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-in fade-in zoom-in"
          >
            {totalCartItems}
          </span>
        )}
      </Button>
    </div>
  );
});
CartButton.displayName = "CartButton";

export function RegisterOrder({ user }: RegisterOrderProps) {
  const { cart, clearCart } = useCart();
  const { mutate } = useCreateOrder(user.company.id);

  const [showThankYou, setShowThankYou] = useState(false);
  const sheetRef = useRef<{ close: () => void }>(null);

  const steps: Step[] = [
    {
      id: 1,
      name: "Carrinho",
      icon: ShoppingBag,
      isStepDisabled: cart.length === 0,
    },
    {
      id: 2,
      name: "Endereço",
      icon: MapIcon,
    },
    { id: 3, name: "Pagamento", icon: CreditCard },
    { id: 4, name: "Finalizar", icon: CheckCircle },
  ];

  const handleOrderSubmit = async (
    data: CheckoutFormValues
  ): Promise<ResponseServerAction> => {
    if (cart.length === 0) {
      toast.error("Seu carrinho está vazio. Adicione produtos para continuar.");
      return { status: StatusServer.error, message: "Carrinho vazio." };
    }

    const lineItems: LineItem[] = cart.map((item) => ({
      productId: item.id,
      productName: item.name,
      sku: item.sku || "",
      unitPrice: item.salePrice,
      quantity: item.quantity,
      totalPrice: item.salePrice * item.quantity,
      photo: typeof item.photo === "string" ? item.photo : "",
    }));

    const subtotal = lineItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const grandTotal = subtotal;

    let shippingAddressForOrder: ShippingAddress | undefined = undefined;

    if (data.deliveryMethod === "delivery") {
      shippingAddressForOrder = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      };
    }

    const orderInput: OrderInput = {
      orderNumber: `#${Date.now().toString().slice(-6)}`,
      status: OrderStatus.Pending,
      lineItems,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      subtotal,
      shippingCost: 0,
      discounts: 0,
      total: grandTotal,
      paymentMethod: data.paymentMethod,
      description: `Pedido realizado por ${data.customerName}`,
      shippingAddress: shippingAddressForOrder,
      notes: "",
    };

    return new Promise((resolve) => {
      mutate(orderInput, {
        onSuccess: (response) => {
          if (response.status === "success") {
            clearCart();
            setShowThankYou(true);
            sheetRef.current?.close(); // fecha o sheet no sucesso
          }
          resolve(response);
        },
        onError: (e) => {
          resolve({ status: StatusServer.error, message: e.message });
        },
      });
    });
  };

  const checkoutInitialData: Partial<CheckoutFormValues> = {
    deliveryMethod: "delivery",
    paymentMethod: PaymentMethodOrder.pix,
  };

  return (
    <>
      <GlobalFormSheet
        initialData={checkoutInitialData}
        steps={steps}
        trigger={<CartButton />}
        onSubmit={handleOrderSubmit}
      >
        <CartProductsList />
        <AddressStep user={user} />
        <PaymentStep />
        <ConfirmationStep user={user} />
      </GlobalFormSheet>
      <ThankYouModal
        show={showThankYou}
        onClose={() => setShowThankYou(false)}
        user={user}
      />
    </>
  );
}
