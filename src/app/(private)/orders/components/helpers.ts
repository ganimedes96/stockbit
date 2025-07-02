import { Order, LineItem, PaymentMethodOrder } from "@/domain/orders/types";
import { formatCurrency } from "@/utils/text/format";

// Objeto para traduzir o enum do método de pagamento
const paymentMethodLabels: Record<PaymentMethodOrder, string> = {
  [PaymentMethodOrder.cash]: "Dinheiro",
  [PaymentMethodOrder.pix]: "Pix",
  [PaymentMethodOrder.creditCard]: "Cartão de Crédito",
  [PaymentMethodOrder.debitCard]: "Cartão de Débito",
};

// 1. Função que cria a lista de itens formatada (sem alterações)
function generateItemsList(lineItems: LineItem[]): string {
  if (!lineItems || lineItems.length === 0) return "Nenhum item no pedido.";

  return lineItems
    .map(
      (item) =>
        `\u27A1 ${item.quantity}x *${item.productName}* - ${formatCurrency(
          item.totalPrice
        )}`
    ) // Usando um código de seta simples e seguro
    .join("\n");
}

// 2. Função que cria as informações de pagamento e entrega (CORRIGIDA)
function generatePaymentAndDeliveryInfo(order: Order): string {
  // Emojis substituídos por seus códigos de escape Unicode
  const paymentEmoji = "\u{1F4B3}"; // 💳
  const paymentLabel =
    paymentMethodLabels[order.paymentMethod] || "Não informado";
  const paymentLine = `${paymentEmoji} ${paymentLabel}`;

  let deliveryLine = "";
  if (order.shippingAddress) {
    const address = order.shippingAddress;
    const deliveryEmoji = "\u{1F6F5}"; // 🛵
    const houseEmoji = "\u{1F3E0}"; // 🏠
    deliveryLine = `${deliveryEmoji} *Entrega em Domicílio*\n${houseEmoji} ${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}`;
  } else {
    const pickupEmoji = "\u{1F6CD}"; // 🛍️
    deliveryLine = `${pickupEmoji} *Retirada no Local*`;
  }

  return `${paymentLine}\n${deliveryLine}`;
}

// Template 1: Pedido Recebido com Sucesso (Revisado)
export const generateOrderReceivedMessage = (order: Order): string => {
  const items = generateItemsList(order.lineItems);
  const paymentAndDelivery = generatePaymentAndDeliveryInfo(order);

  const message = `Olá, *${
    order.customerName
  }*! \u{1F44B}\n\nRecebemos seu pedido *${
    order.orderNumber
  }* e já estamos preparando tudo com carinho! \u{2728}\n\n*RESUMO DO PEDIDO*\n${items}\n\n${paymentAndDelivery}\n\n*Total:* *${formatCurrency(
    order.total
  )}*\n\nObrigado pela preferência! \u{1F609}`.trim();

  return message;
};

// Template 2: Pedido Saiu para Entrega (Revisado)
export const generateShippedMessage = (order: Order): string => {
  const message =
    `Boas notícias, *${order.customerName}*! \u{1F6F5}\n\nSeu pedido *${order.orderNumber}* já saiu para entrega e deve chegar em breve!\n\n*Endereço de Entrega:*\n${order.shippingAddress?.street}, ${order.shippingAddress?.number}\n${order.shippingAddress?.city}\n\nSe precisar de algo, é só chamar!`.trim();

  return message;
};

// Template 3: Pedido Pronto para Retirada (Revisado)
export const generatePickupReadyMessage = (order: Order): string => {
  const message =
    `Olá, *${order.customerName}*! \u2705\n\nSeu pedido *${order.orderNumber}* já está separado e pronto para ser retirado em nossa loja!\n\n*Nosso endereço:*\nRua Principal, 123 - Centro, Sua Cidade\n\nAguardamos você!`.trim();

  return message;
};
