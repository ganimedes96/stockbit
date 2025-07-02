import { Product } from "../product/types";



export type Category = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type CategoryWithProducts = Category & {
  products: Product[];
};

export type CategoryInput = Omit<Category, "id"  | "createdAt" | "updatedAt">;
export type CategoryUpdateInput = Partial<CategoryInput> & { id: string };