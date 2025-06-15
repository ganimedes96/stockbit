"use server";

import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { Product } from "./types";

export async function getProductsServer(companyId: string): Promise<Product[]> {
  const productsRef = db
    .collection(Collections.companies)
    .doc(companyId)
    .collection(Collections.products);

  const productsSnapshot = await productsRef.get();

  const products: Product[] = productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      
      id: doc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Product;
  });

  return products;
}
