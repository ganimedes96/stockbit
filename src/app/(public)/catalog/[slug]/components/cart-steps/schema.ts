import { z } from "zod";
import { PaymentMethodOrder } from "@/domain/orders/types";

const onlyNumbers = (value: string) => (value ? value.replace(/\D/g, "") : "");

// 1. O baseAddressSchema agora contém TODAS as regras de validação com .min(1)
// Por padrão, todos os campos definidos em um z.object() são obrigatórios.
const baseAddressSchema = z.object({
  customerName: z.string( { required_error: "O nome do cliente é obrigatório." }),
  customerEmail: z.string().email("E-mail inválido.").optional(),
  customerPhone: z.string( { required_error: "O telefone é obrigatório." }),
  zipCode: z.string( { required_error: "O CEP é obrigatório." })
    .transform((val) => onlyNumbers(val))
    .refine((val) => val.length === 8, {
      message: "CEP inválido. Deve conter 8 dígitos.",
    }),
  street: z.string({ required_error: "A rua é obrigatória." }),
  number: z.string( { required_error: "O número é obrigatório." }),
  complement: z.string().optional(),
  neighborhood: z.string( { required_error: "O bairro é obrigatório." }),
  city: z.string( { required_error: "A cidade é obrigatória." }),
  state: z.string( { required_error: "O estado é obrigatório." }),
});

// 2. Schema para 'Retirar na Loja'.
// Ele só precisa dos dados do cliente, então pegamos apenas esses campos do schema base.
const pickupSchema = z.object({
  deliveryMethod: z.literal("pickup"),
  shippingAddress: baseAddressSchema.pick({ 
      customerName: true, 
      customerEmail: true, 
      customerPhone: true 
    }),
});

// 3. Schema para 'Entrega em Domicílio'.
// Ele usa o baseAddressSchema DIRETAMENTE, que já tem todos os campos como obrigatórios.
const deliverySchema = z.object({
  deliveryMethod: z.literal("delivery"),
  shippingAddress: baseAddressSchema,
});

// 4. O discriminatedUnion continua orquestrando tudo.
export const checkoutSchema = z.discriminatedUnion("deliveryMethod", [
  pickupSchema,
  deliverySchema,
]);

// 5. Adicionamos o schema de pagamento no final.
const paymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethodOrder, {
    required_error: "Por favor, selecione um método de pagamento.",
  }),
});

export const finalCheckoutSchema = checkoutSchema.and(paymentSchema);

export type CheckoutFormValues = z.infer<typeof finalCheckoutSchema>;