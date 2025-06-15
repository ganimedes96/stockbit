import { Product } from "../product/types";

export type Supplier = {
  id: string;              
  name: string;
  cpf_cnpj?: string;            
  email?: string;
  phone?: string;
  address?: string;
  description?: string;           
  createdAt: Date;
  updatedAt?: Date;
};


export type SupplierInput = Omit<Supplier, "id" | "updatedAt" | "createdAt">;
export type SupplierUpdateInput = Partial<SupplierInput> & { id: string };

export type SupplierWithProducts = Supplier & {
  products: Product[];
};