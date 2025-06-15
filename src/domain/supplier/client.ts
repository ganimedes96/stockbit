"use client";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import { Supplier } from "./types";


export async function getSuppliers(companyId: string): Promise<Supplier[]> {
  try {
    const suppliersRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.suppliers
    );
    const suppliersSnapshot = await getDocs(
      query(suppliersRef, orderBy("createdAt", "desc"))
    );
    const suppliers: Supplier[] = suppliersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Supplier;
    });
    return suppliers;
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao buscar fornecedores");
  }
}