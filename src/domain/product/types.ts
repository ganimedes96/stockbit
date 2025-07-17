export type Product = {
  id: string;
  name: string;
  photo?: string | File;
  sku?: string;
  description?: string;
  hasAnExpirationDate: boolean;
  expirationDate?: Date;
  isActive: boolean;
  isFavorite?: boolean;
  categoryId: string;
  supplierId?: string;
  salePrice: number;
  purchasePrice: number;
  openingStock: number;
  minimumStock: number;
  createdAt?: Date;
  updatedAt?: Date;
};


export type ProductInput = Omit<Product, "id" | "updatedAt"> 
export type ProductUpdateInput = Partial<ProductInput> & {
  id: string;
  updatedAt?: Date;
};


export type ProductList = Partial<Product> & {
  category: {
    id: string;
    name: string;
  };
};
