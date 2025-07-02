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
import { Category } from "./types";

export async function getCategories(companyId: string): Promise<Category[]> {
  try {
    const categoriesRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.categories
    );
    const categoriesSnapshot = await getDocs(
      query(categoriesRef, orderBy("createdAt", "desc"))
    );
    const categories: Category[] = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Category;
    });
    return categories;
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao buscar categorias");
  }
}

export async function getCategoryById(companyId: string, categoryId: string) {
  try {
    const categoryRef = doc(
      db,
      Collections.companies,
      companyId,
      Collections.categories,
      categoryId
    );
    const categoryDoc = await getDoc(categoryRef);
    if (!categoryDoc.exists()) return null;
    const category = categoryDoc.data();
    if (!category) return null;
    return {
      name: category.name || "",
      description: category.description || "",
      id: categoryDoc.id,
      createdAt: category.createdAt.toDate(),
      updatedAt: category.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao buscar categoria");
  }
}
