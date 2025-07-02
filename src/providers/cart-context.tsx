"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/domain/product/types";
import { toast } from "sonner"; // Usado para dar feedback ao usuário

// O tipo para um item dentro do carrinho
export interface CartItem extends Product {
  quantity: number;
  
};

// A "forma" do nosso contexto: o que ele irá prover para os componentes
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  totalCartItems: number;
  isCartHydrated: boolean;
}

// Cria o contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// O componente Provedor que irá envolver sua aplicação
export function CartProvider({ children }: { children: ReactNode }) {
  // Estado para o carrinho e para controlar a hidratação inicial
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  // Efeito para carregar o carrinho do localStorage APÓS a primeira renderização no cliente
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shoppingCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Falha ao carregar o carrinho do localStorage", error);
    }
    setIsCartHydrated(true); 
  }, []);

  // Efeito para salvar o carrinho no localStorage TODA VEZ que ele mudar
  useEffect(() => {
    if (isCartHydrated) {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }
  }, [cart, isCartHydrated]);

  // --- LÓGICA DO CARRINHO ---

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    // Lógica de validação de estoque
    const itemInCart = cart.find(item => item.id === product.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;
    const availableStock = product.openingStock; // Pega o estoque do objeto Product

    // Verifica se a nova quantidade ultrapassaria o estoque
    if (currentQuantityInCart + quantityToAdd > availableStock) {
      toast.error(`Estoque insuficiente para "${product.name}".`, {
        description: `Apenas ${availableStock} unidades disponíveis.`,
      });
      return; // Interrompe a função aqui
    }

    // Se o estoque for suficiente, prossegue com a lógica normal
    setCart(currentCart => {
      if (itemInCart) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        return [...currentCart, { 
          ...product,
          quantity: quantityToAdd
        }];
      }
    });
    toast.success(`${product.name} foi adicionado ao carrinho!`);
  }

  const decreaseQuantity = (productId: string) => {
    setCart(currentCart => {
      const itemInCart = currentCart.find(item => item.id === productId);

      // Se a quantidade do item é 1, removê-lo do carrinho é o mesmo que chamar removeFromCart
      if (itemInCart?.quantity === 1) {
        return currentCart.filter(item => item.id !== productId);
      }

      // Se a quantidade for maior que 1, apenas diminui
      return currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };
  
  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
    toast.info("Item removido do carrinho.");
  };

  const clearCart = () => { 
    setCart([]); 
    toast.info("Carrinho esvaziado.");
  };

  // Calcula o número total de itens no carrinho (somando as quantidades)
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // O valor que será provido para todos os componentes filhos
  const value = { 
    cart, 
    addToCart, 
    removeFromCart, 
    decreaseQuantity, 
    clearCart, 
    totalCartItems, 
    isCartHydrated 
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook customizado que simplifica o uso do contexto nos componentes
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}