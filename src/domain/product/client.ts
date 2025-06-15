"use client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import { Product } from "./types";

export async function getProducts(companyId: string): Promise<Product[]> {
  try {
    const productsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.products
    );

    const productsQuery = query(productsRef, orderBy("createdAt", "desc"));
    const productsSnapshot = await getDocs(productsQuery);

    const products: Product[] = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product;
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function getProductById(companyId: string, productId: string) {
  try {
    const productRef = doc(
      db,
      Collections.companies,
      companyId,
      Collections.products,
      productId
    );
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists) return null;
    const product = productDoc.data();
    if (!product) return null;
    return product;
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao buscar produto");
  }
}
