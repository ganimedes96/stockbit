"use server";

import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { NeighborhoodInput, NeighborhoodUpdate } from "./types";

export async function createNeighborhood(
  companyId: string,
  neighborhoodData: NeighborhoodInput
): Promise<ResponseServerAction> {
  try {
    const companyRef = db.collection(Collections.companies).doc(companyId);
    const neighborhoodsRef = companyRef.collection(Collections.neighborhoods);

    // Verifica se o bairro já existe
    const existingNeighborhoodSnap = await neighborhoodsRef
      .where("name", "==", neighborhoodData.name)
      .limit(1)
      .get();

    if (!existingNeighborhoodSnap.empty) {
      return {
        status: StatusServer.error,
        message: "Bairro já cadastrado.",
      };
    }

    // Cria o novo bairro
    const newNeighborhoodRef = neighborhoodsRef.doc();
    await newNeighborhoodRef.set({
      ...neighborhoodData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: StatusServer.success,
      message: "Bairro cadastrado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao criar bairro:", error);
    let errorMessage = "Erro ao cadastrar bairro.";
    if (error instanceof Error) {
      errorMessage = `Erro ao cadastrar bairro: ${error.message}`;
    }
    return {
      status: StatusServer.error,
      message: errorMessage,
    };
  }
}



export async function updateNeighborhood(
  companyId: string,
  neighborhoodData: NeighborhoodUpdate
): Promise<ResponseServerAction> {
  try {
    const neighborhoodRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.neighborhoods)
      .doc(neighborhoodData.id);

    // Verifica se o bairro existe
    const neighborhoodSnap = await neighborhoodRef.get();
    if (!neighborhoodSnap.exists) {
      return {
        status: StatusServer.error,
        message: "Bairro não encontrado.",
      };
    }

    // Atualiza o bairro
    await neighborhoodRef.update({
      ...neighborhoodData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: StatusServer.success,
      message: "Bairro atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar bairro:", error);
    let errorMessage = "Erro ao atualizar bairro.";
    if (error instanceof Error) {
      errorMessage = `Erro ao atualizar bairro: ${error.message}`;
    }
    return {
      status: StatusServer.error,
      message: errorMessage,
    };
  }
}


export async function updateNeighborhoodStatus(
  companyId: string,
  neighborhoodId: string,
  status: boolean
): Promise<ResponseServerAction> {
  try {
    const neighborhoodRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.neighborhoods)
      .doc(neighborhoodId);

    // Verifica se o bairro existe
    const neighborhoodSnap = await neighborhoodRef.get();
    if (!neighborhoodSnap.exists) {
      return {
        status: StatusServer.error,
        message: "Bairro não encontrado.",
      };
    }

    // Atualiza o status do bairro
    await neighborhoodRef.update({
      isActive: status,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: StatusServer.success,
      message: `Status do bairro atualizado para ${status ? 'ativo' : 'inativo'}.`,
    };
  } catch (error) {
    console.error("Erro ao atualizar status do bairro:", error);
    let errorMessage = "Erro ao atualizar status do bairro.";
    if (error instanceof Error) {
      errorMessage = `Erro ao atualizar status do bairro: ${error.message}`;
    }
    return {
      status: StatusServer.error,
      message: errorMessage,
    };
  }
}