"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useProductList } from "@/domain/product/queries";
import { useCategoryList } from "@/domain/category/queries"; // Usaremos para os filtros
import { User } from "@/domain/user/types";
import { Product } from "@/domain/product/types";

// Componentes e Ícones
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/text/format";
import {
  Barcode,
  Loader2,
  Maximize,
  Minimize,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import ImageDefault from "@/assets/default.png"; // Ajuste o caminho se necessário
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCreatePdvOrder } from "@/domain/orders/queries";
import {
  OrderInput,
  OrderOrigin,
  OrderStatus,
  PaymentMethodOrder,
} from "@/domain/orders/types";
import { PaymentConfirmationModal } from "./modal-finishi-order";
import { OpenCashDrawerModal } from "./open-cash-drawer-modal";
import {
  useGetOpenCashSession,
  useOpenCashSession,
} from "@/domain/cash-closing/queries";
import { saveOrderToQueue } from "@/lib/db/indexed-db";

// Tipagem para os itens do carrinho
type CartItem = Product & { quantity: number };

interface PDVSystemProps {
  user: User;
}

export function PDVSystem({ user }: PDVSystemProps) {
  // --- ESTADOS DO COMPONENTE ---

  const [shouldOpenDrawerModal, setShouldOpenDrawerModal] = useState(false);
  const [isBlockedByOldSession, setIsBlockedByOldSession] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [scannedCode, setScannedCode] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const { data: products, isLoading: isLoadingProducts } = useProductList(
    user.company.id
  );
  const { data: categories, isLoading: isLoadingCategories } = useCategoryList(
    user.company.id
  );

  const { data: isOpenSession, isLoading: isLoadingOpenSession } =
    useGetOpenCashSession(user.company.id);

  const { mutate: openCashSession } = useOpenCashSession(user.company.id);

  const { mutate: createPdvOrder, isPending: isLoadingOrder } =
    useCreatePdvOrder(user.company.id);

  const isLoading = isLoadingProducts || isLoadingCategories;

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.salePrice * item.quantity,
      0
    );
  }, [cart]);

  useEffect(() => {
    if (isLoadingOpenSession) return;

    if (!isOpenSession) {
      // Nenhuma sessão aberta → precisa abrir o caixa
      setShouldOpenDrawerModal(true);
      setIsBlockedByOldSession(false);
    } else {
      const sessionDate = new Date(isOpenSession.startingOpen); // ajuste conforme o nome do campo
      const today = new Date();

      const isSameDay =
        sessionDate.getFullYear() === today.getFullYear() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getDate() === today.getDate();

      if (!isSameDay) {
        // Existe sessão, mas é do dia anterior → bloqueia
        setShouldOpenDrawerModal(false);
        setIsBlockedByOldSession(true);
      } else {
        // Existe sessão e é válida
        setShouldOpenDrawerModal(false);
        setIsBlockedByOldSession(false);
      }
    }
  }, [isOpenSession, isLoadingOpenSession]);
  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Erro ao ativar tela cheia: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- LÓGICA DO CARRINHO ---
  const addProductToCart = useCallback(
    (productId: string) => {
      const product = products?.find((p) => p.id === productId);
      if (!product || product.openingStock <= 0) {
        toast.error("Produto esgotado ou não encontrado.");
        return;
      }

      setCart((currentCart) => {
        const itemInCart = currentCart.find((item) => item.id === productId);
        if (itemInCart) {
          if (itemInCart.quantity >= product.openingStock) {
            toast.warning(`Estoque máximo para "${product.name}" atingido.`);
            return currentCart;
          }
          return currentCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...currentCart, { ...product, quantity: 1 }];
      });
    },
    [products]
  );

  const updateQuantity = (productId: string, change: number) => {
    setCart((currentCart) => {
      const itemInCart = currentCart.find((item) => item.id === productId);
      if (!itemInCart) return currentCart;

      const newQuantity = itemInCart.quantity + change;
      if (newQuantity > itemInCart.openingStock) {
        toast.warning(`Estoque máximo para "${itemInCart.name}" atingido.`);
        return currentCart;
      }

      if (newQuantity <= 0) {
        return currentCart.filter((item) => item.id !== productId);
      }

      return currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  // --- LÓGICA DE CONTROLE (LEITOR, FULLSCREEN, OFFLINE) ---
  useEffect(() => {
    let barcodeBuffer = "";
    let barcodeTimer: NodeJS.Timeout;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      if (event.key === "Enter") {
        event.preventDefault();
        if (barcodeBuffer.length > 0) {
          const product = products?.find((p) => p.sku === barcodeBuffer);
          if (product) {
            addProductToCart(product.id);
          } else {
            toast.error("Produto não encontrado com este código.");
          }
          barcodeBuffer = "";
          setScannedCode("");
        }
        return;
      }
      if (event.key.length === 1) {
        barcodeBuffer += event.key;
        setScannedCode(barcodeBuffer);
      }
      clearTimeout(barcodeTimer);
      barcodeTimer = setTimeout(() => {
        barcodeBuffer = "";
        setScannedCode("");
      }, 150);
    };
    window.addEventListener("keydown", handleKeyDown);

    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.body.style.overflow = "auto";
    };
  }, [products, addProductToCart]);

  // --- FILTRAGEM DOS PRODUTOS PARA EXIBIÇÃO ---
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategoryId === "all") return products.filter((p) => p.isActive);
    return products.filter((p) => p.categoryId === activeCategoryId);
  }, [products, activeCategoryId]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    // Efeito para remover o scroll da página
    // document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleConfirmSale = async (paymentMethod: PaymentMethodOrder) => {
    if (cart.length === 0) {
      toast.error("O carrinho está vazio.");
      return;
    }
    // Monta o objeto OrderInput final
    const orderInput: OrderInput = {
      orderNumber: `#${Date.now().toString().slice(-4)}`,
      status: OrderStatus.completed, // PDV geralmente já é entregue
      origin: OrderOrigin.PDV,
      clientId: user.id,
      companyId: user.company.id,
      lineItems: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        sku: item.sku || "",
        unitPrice: item.salePrice,
        quantity: item.quantity,
        totalPrice: item.salePrice * item.quantity,
        photo: typeof item.photo === "string" ? item.photo : "",
      })),
      customerName: "Cliente Balcão",
      subtotal: subtotal,
      shippingCost: 0,
      discounts: 0,
      total: subtotal,
      paymentMethod: paymentMethod, // Usa o método de pagamento vindo do modal
    };

    try {   
      if (isOnline) throw new Error("Offline");

      createPdvOrder(orderInput, {
        onSuccess: () => {
          setCart([]); // Limpa o carrinho
        },
      });
    } catch (error) {
      console.warn("Falha na conexão, salvando venda offline:", error);
      await saveOrderToQueue(orderInput);
      toast.info("Venda salva offline! Será sincronizada depois.");
      setCart([]);
      setIsPaymentModalOpen(false);
    } // Chama a mutação do TanStack Query
  };

  const handleOpenCashDrawer = (initialAmount: number) => {
    openCashSession({ openingBalance: initialAmount, operationId: user.id });
  };

  // Se o caixa não estiver aberto, mostra o modal de abertura
  if (shouldOpenDrawerModal) {
    return (
      <OpenCashDrawerModal
        user={user}
        isOpen
        onClose={() => {
          toast.error("Caixa fechado", {
            description: "Por favor, abra o caixa para registrar a venda.",
          });
        }}
        onConfirm={handleOpenCashDrawer}
      />
    );
  }

  return (
    <>
      <main className="flex flex-col md:flex-row flex-1 bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden">
        {/* Seção Principal: Leitura de Produtos (Ocupa 2/3 da tela em desktop) */}
        <div className="w-full md:w-2/3 p-4 flex flex-col gap-4">
          {/* Filtros de Categoria */}
          <header className="mb-4 flex-shrink-0 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Ponto de Venda
              </h1>
              <p className="text-slate-400">
                Adicione produtos via clique ou leitor de código de barras.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFullscreenToggle}
              title={
                isFullscreen ? "Sair da Tela Cheia" : "Entrar em Tela Cheia"
              }
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </header>
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold mb-2">Categorias</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full" />
                ))
              ) : (
                <>
                  <Badge
                    onClick={() => setActiveCategoryId("all")}
                    variant={
                      activeCategoryId === "all" ? "default" : "secondary"
                    }
                    className="cursor-pointer px-4 py-2 text-sm"
                  >
                    Todas
                  </Badge>
                  {categories?.map((category) => (
                    <Badge
                      key={category.id}
                      onClick={() => setActiveCategoryId(category.id)}
                      variant={
                        activeCategoryId === category.id
                          ? "default"
                          : "secondary"
                      }
                      className="cursor-pointer px-4 py-2 text-sm"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1 ">
            <ScrollArea className="h-[470px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton key={i} className="w-full h-48 rounded-lg" />
                    ))
                  : filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        onClick={() => addProductToCart(product.id)}
                        className={`overflow-hidden transition-all duration-200 ${
                          product.openingStock > 0
                            ? "cursor-pointer hover:scale-105 hover:shadow-lg"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={
                              typeof product.photo === "string" ||
                              typeof product.photo === "undefined"
                                ? product.photo || ImageDefault
                                : ImageDefault
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {product.openingStock <= 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <p className="font-bold text-white text-lg">
                                ESGOTADO
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm truncate">
                            {product.name}
                          </h3>
                          <p className="font-bold text-primary">
                            {formatCurrency(product.salePrice)}
                          </p>
                        </div>
                      </Card>
                    ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>

        {isBlockedByOldSession ? (
          <div className="w-full md:w-1/3 bg-white dark:bg-gray-900 p-4 flex flex-col items-center justify-center text-center border-t-2 md:border-t-0 md:border-l-2 border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Caixa em Aberto
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              O caixa do dia anterior ainda está aberto. <br />
              Por favor, finalize a sessão anterior antes de iniciar novas
              vendas.
            </p>
          </div>
        ) : (
          <aside className="relative w-1/3 bg-white dark:bg-gray-900 p-4 flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pedido Atual</h2>
              <div
                className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                  isOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isOnline ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span>
                  {isOnline
                    ?  "Online"
                    : "Offline"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <Barcode className="h-4 w-4" />
                <span>{scannedCode || "Aguardando..."}</span>
              </div>
            </div>
            <div className="flex flex-col flex-1 min-h-0">
              <ScrollArea className="h-[550px] pr-2">
                {" "}
                {/* 👈 min-h-0 é crucial para flex layouts */}
                <div className="flex-1 space-y-4 pr-2">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center  text-gray-500">
                      <ShoppingCart className="h-12 w-12 mb-2" />
                      <p>O carrinho está vazio.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
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
                          <p className="font-medium text-sm line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.salePrice * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
            {cart.length > 0 && (
              <div className=" sticky bottom-0 border-t pt-4 mt-4">
                <div className="space-y-2 text-lg">
                  <div className="flex justify-between font-bold text-2xl">
                    <h2 className="font-bold text-xl md:text-2xl xl:text-4xl">
                      Total
                    </h2>
                    <span className="font-bold text-xl md:text-2xl xl:text-4xl ">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full font-bold text-lg mt-4"
                  disabled={cart.length === 0 || isLoadingOrder}
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  {isLoadingOrder ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Finalizar Venda"
                  )}
                </Button>
              </div>
            )}
          </aside>
        )}
        {/* Seção Lateral: Carrinho (Ocupa 1/3 da tela em desktop) */}
      </main>
      <PaymentConfirmationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={subtotal}
        onConfirm={handleConfirmSale}
        isSubmitting={isLoadingOrder}
      />
    </>
  );
}
