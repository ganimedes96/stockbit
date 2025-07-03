import { z } from "zod";
import { PaymentMethodOrder } from "@/domain/orders/types";

const onlyNumbers = (value: string) => (value ? value.replace(/\D/g, "") : "");

// Bloco de campos de contato que são comuns a ambos os cenários
const customerInfoSchema = {
  customerName: z.string().min(1, "O nome do cliente é obrigatório."),
  customerEmail: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  customerPhone: z.string().min(1, "O telefone é obrigatório."),
};

// Bloco de campos de endereço que só são obrigatórios para entrega
const deliveryAddressSchema = {
  zipCode: z.string()
    .min(1, "O CEP é obrigatório.")
    .transform((val) => onlyNumbers(val))
    .refine((val) => val.length === 8, {
      message: "CEP inválido. Deve conter 8 dígitos.",
    }),
  street: z.string().min(1, "A rua é obrigatória."),
  number: z.string().min(1, "O número é obrigatório."),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório."),
  city: z.string().min(1, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório.").max(2, "Use a sigla do estado (UF)."),
};

// Schema para o caso de 'Retirar na Loja'
const pickupSchema = z.object({
  deliveryMethod: z.literal("pickup"),
  ...customerInfoSchema,
  // CORREÇÃO: Adicionamos os campos de endereço como opcionais para que o tipo seja consistente.
  // O Zod não irá validá-los porque são opcionais.
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Schema para o caso de 'Entrega em Domicílio'
const deliverySchema = z.object({
  deliveryMethod: z.literal("delivery"),
  ...customerInfoSchema,
  ...deliveryAddressSchema, // Aqui os campos são obrigatórios
});

// O 'discriminatedUnion' une tudo
export const checkoutSchema = z.discriminatedUnion("deliveryMethod", [
  pickupSchema,
  deliverySchema,
]);

// Adicionamos o schema de pagamento no final
const paymentSchema = z.object({
    paymentMethod: z.nativeEnum(PaymentMethodOrder, {
        required_error: "Por favor, selecione um método de pagamento.",
    }),
});

export const finalCheckoutSchema = checkoutSchema.and(paymentSchema);

// O tipo de dados inferido
export type CheckoutFormValues = z.infer<typeof finalCheckoutSchema>;
