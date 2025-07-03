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
        `➡ ${item.quantity}x *${item.productName}* - ${formatCurrency(
          item.totalPrice
        )}`
    )
    .join("\n");
}

// 2. Função que cria as informações de pagamento e entrega (sem emojis)
function generatePaymentAndDeliveryInfo(order: Order): string {
  const paymentLabel =
    paymentMethodLabels[order.paymentMethod] || "Não informado";
  const paymentLine = `Pagamento: ${paymentLabel}`;

  let deliveryLine = "";
  if (order.shippingAddress) {
    const address = order.shippingAddress;
    deliveryLine = `Entrega em Domicílio\n${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}`;
  } else {
    deliveryLine = `Retirada no Local`;
  }

  return `${paymentLine}\n${deliveryLine}`;
}

// Template 1: Pedido Recebido com Sucesso (sem emojis)
export const generateOrderReceivedMessage = (order: Order): string => {
  const items = generateItemsList(order.lineItems);
  const paymentAndDelivery = generatePaymentAndDeliveryInfo(order);

  const message = `Olá, *${
    order.customerName
  }*!\n\nRecebemos seu pedido *${
    order.orderNumber
  }* e já estamos preparando tudo com carinho!\n\n*RESUMO DO PEDIDO*\n${items}\n\n${paymentAndDelivery}\n\n*Total:* *${formatCurrency(
    order.total
  )}*\n\nObrigado pela preferência!`.trim();

  return message;
};

// Template 2: Pedido Saiu para Entrega (sem emojis)
export const generateShippedMessage = (order: Order): string => {
  const message =
    `Boas notícias, *${order.customerName}*!\n\nSeu pedido *${order.orderNumber}* já saiu para entrega e deve chegar em breve!\n\n*Endereço de Entrega:*\n${order.shippingAddress?.street}, ${order.shippingAddress?.number}\n${order.shippingAddress?.city}\n\nSe precisar de algo, é só chamar!`.trim();

  return message;
};

// Template 3: Pedido Pronto para Retirada (sem emojis)
export const generatePickupReadyMessage = (order: Order): string => {
  const message =
    `Olá, *${order.customerName}*!\n\nSeu pedido *${order.orderNumber}* já está separado e pronto para ser retirado em nossa loja!\n\n*Nosso endereço:*\nRua Principal, 123 - Centro, Sua Cidade\n\nAguardamos você!`.trim();

  return message;
};
