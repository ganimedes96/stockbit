import { Product } from "../product/types";

export type Supplier = {
  id: string;              
  name: string;
  type?: "PJ" | "PF";
  document?: string; // Pessoa Jurídica ou Pessoa Física      
  email?: string;
  phone?: string;
  status?: boolean;
  legalName?: string;
  address: {
    zipCode: string; // CEP
    city: string;
    state: string;
  };
  description?: string;
  defaultPaymentTerms?: number| string;          
  createdAt: Date;
  updatedAt?: Date;
};


export type SupplierInput = Omit<Supplier, "id" | "updatedAt" >;
export type SupplierUpdateInput = Omit<Supplier, "createdAt"> ;

export type SupplierWithProducts = Supplier & {
  products: Product[];
};