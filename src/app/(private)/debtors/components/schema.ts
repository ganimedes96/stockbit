import { z } from "zod";

export const ProductDebtorSchema = z.object({
  productId: z.string().min(1, "O ID do produto é obrigatório."),
  quantity: z.coerce
    .number()
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade deve ser um número positivo."),
  priceUnit: z.coerce
    .number()
    .positive("O preço unitário deve ser um número positivo."),
});
const BaseDebtorsSchema = z.object({
  clientId: z.string().min(1, "O ID do cliente é obrigatório."),
  products: z
    .array(ProductDebtorSchema)
    .min(1, "É necessário pelo menos um produto."),
  isCash: z.boolean(),
  isInstallments: z.boolean(),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),

  cashPayment: z
    .object({
      dueDate: z.date({
        required_error: "A data de vencimento é obrigatória.",
        invalid_type_error: "A data de vencimento deve ser uma data válida.",
      }),
    })
    .optional(),

  paymentInInstallments: z
    .object({
      dueDate: z.date({
        required_error: "A data da 1ª parcela é obrigatória.",
        invalid_type_error: "A data da 1ª parcela deve ser uma data válida.",
      }),
      installments: z.coerce.number().int().positive(),
      interval: z.coerce.number().int().positive(),
    })
    .optional(),
});

// APLICAÇÃO DA LÓGICA CONDICIONAL
export const DebtorsCreateSchema = BaseDebtorsSchema.superRefine(
  (data, ctx) => {
    if (data.isCash && !data.cashPayment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Os detalhes do pagamento à vista são obrigatórios.",
        path: ["cashPayment", "dueDate"],
      });
    }

    if (data.isInstallments && !data.paymentInInstallments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Os detalhes do pagamento parcelado são obrigatórios.",
        path: ["PaymentInInstallments", "installments"], // Aponta para um dos campos
      });
    }

    if (data.isCash && data.isInstallments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Apenas um método de pagamento pode ser selecionado.",
        path: ["isCash"],
      });
    }
  }
).transform((data) => {
  if (data.isCash) {
    return {
      ...data,
      PaymentInInstallments: undefined,
    };
  }

  if (data.isInstallments) {
    return {
      ...data,
      cashPayment: undefined,
    };
  }

  return data;
});

export const DebtorsSchema = DebtorsCreateSchema;
