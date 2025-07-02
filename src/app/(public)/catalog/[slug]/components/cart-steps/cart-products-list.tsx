"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/text/format";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import ImageDefault from "@/assets/default.png"; // Use sua imagem padrão
import { useMemo } from "react";
import { useCart } from "@/providers/cart-context";
import { Scrollbar } from "@radix-ui/react-scroll-area";

export function CartProductsList() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart } =
    useCart();

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.salePrice * item.quantity,
      0
    );
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">Seu carrinho está vazio</h3>
        <p className="text-sm text-muted-foreground">
          Adicione produtos do catálogo para continuar.
        </p>
      </div>
    );
  }

  // Se houver itens, mostra a lista.
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4 px-1">Resumo do Carrinho</h3>
      <ScrollArea className="max-h-[350px] overflow-y-auto">
        <div className="space-y-4">
          {/* 4. Mapeamos os itens do carrinho para renderizar cada linha. */}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <Image
                src={
                  typeof item.photo === "string" ||
                  typeof item.photo === "undefined"
                    ? item.photo || ImageDefault
                    : ImageDefault
                }
                alt={item.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.salePrice)}
                </p>
              </div>

              {/* 5. Controles de Quantidade */}
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  type="button"
                  variant="outline"
                  className="h-8 w-8 disabled:opacity-50"
                  onClick={() => decreaseQuantity(item.id)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-bold">
                  {item.quantity}
                </span>
                {/* O addToCart já tem a lógica para incrementar, então podemos reutilizá-la */}
                <Button
                  size="icon"
                  variant="outline"
                  type="button"
                  className="h-8 w-8"
                  onClick={() => addToCart(item, 1)}
                   disabled={item.quantity >= item.openingStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-24 text-right font-medium">
                {formatCurrency(item.salePrice * item.quantity)}
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Scrollbar orientation="vertical" />
      </ScrollArea>

      {/* 6. Rodapé com o subtotal e o botão de Limpar Carrinho */}
      <div className="mt-auto pt-4">
        <Separator className="my-4" />
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Taxas de entrega serão calculadas no próximo passo.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCart}
          className="w-full mt-4"
        >
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
}
