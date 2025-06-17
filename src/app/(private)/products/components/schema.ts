import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const formProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isActive: z.boolean(),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Categoria é obrigatório"),
  supplierId: z.string().optional(),
  salePrice: z.coerce.number().min(0.01, "O preço de venda deve ser positivo."),
  purchasePrice: z.coerce
    .number()
    .min(0, "O preço de compra não pode ser negativo."),
  openingStock: z.coerce
    .number()
    .int("O estoque deve ser um número inteiro.")
    .min(0, "O estoque não pode ser negativo."),
  minimumStock: z.coerce
    .number()
    .int("O estoque deve ser um número inteiro.")
    .min(0, "O estoque não pode ser negativo."),
  photo: z
    .union([z.instanceof(File), z.string(), z.null()])
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file instanceof File;
    }, "Arquivo inválido")
    .refine((file) => {
      if (!file) return true;
      if (file instanceof File) {
        return file.size <= MAX_FILE_SIZE;
      }
      return true;
    }, "O tamanho da imagem deve ser no máximo 5MB")
    .refine((file) => {
      if (!file) return true;
      if (file instanceof File) {
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      }
      return true;
    }, "Formato inválido. Somente arquivos JPG, JPEG e PNG são permitidos"),
});

export type FormProductValues = z.infer<typeof formProductSchema>;
