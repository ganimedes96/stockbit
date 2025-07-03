import { Collections } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/firebase";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { Neighborhood } from "./types";



export async function  getNeighborhoods(companyId: string) {
  const clientsRef = collection(
      db,
      Collections.companies,
      companyId,
      Collections.neighborhoods
    );
    const q = query(clientsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
  
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        id: doc.id,
      } as Neighborhood;
    });
}


export async function getNeighborhoodById(
  companyId: string,
  neighborhoodId: string
): Promise<Neighborhood | null> {
  try {
    // 1. Usa a função 'doc' para criar uma referência direta ao documento.
    const neighborhoodRef = doc(
      db,
      Collections.companies,
      companyId,
      Collections.neighborhoods,
      neighborhoodId
    );

    // 2. Usa 'getDoc' para buscar o snapshot desse único documento.
    const neighborhoodDoc = await getDoc(neighborhoodRef);

    // 3. Verifica se o documento realmente existe.
    if (!neighborhoodDoc.exists()) {
      console.warn(`Bairro com ID ${neighborhoodId} não encontrado.`);
      return null;
    }

    // 4. Pega os dados e faz a conversão de Timestamps.
    const data = neighborhoodDoc.data()

    return {
      id: neighborhoodDoc.id,
      name: data.name,
      isActive: data.isActive,
      deliveryFee: data.deliveryFee,
      minOrderValueForFreeShipping: data.minOrderValueForFreeShipping,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Neighborhood;
    
  } catch (error) {
    console.error("Erro ao buscar bairro por ID:", error);
    return null; // Retorna nulo em caso de erro para não quebrar a aplicação.
  }
}