"use server";
import { db,  firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { CreateClient, UpdateClient } from "./types";
import { ResponseServerAction, StatusServer } from "@/api/types";


export async function createClient(
  companyId: string,
  client: CreateClient
): Promise<ResponseServerAction> {
  try {

    const clientsRefPhone = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .where("phone", "==", client.phone)
      .get();

    if (!clientsRefPhone.empty) {
      throw new Error("Um cliente com esse telefone já existe");
    }

    const clientsRefEmail = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .where("email", "!=", "")
      .where("email", "==", client.email)
      .get();

    if (!clientsRefEmail.empty) {
      throw new Error("Um cliente com esse email já existe");
    }

  

    const body = {
      ...client,
      createdAt: firestore.Timestamp.now(),
    };
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .add(body);

    return {
      status: StatusServer.success,
      message: "Cliente criado com sucesso",
    };
  } catch (error) {
    console.error("Error creating client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}



export async function updateClient(
  companyId: string,
  clientId: string,
  client: UpdateClient
): Promise<ResponseServerAction> {
  try {
    const clientRefEmail = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .where("email", "!=", "")
      .where("email", "==", client.email)
      .get();

    const clients = clientRefEmail.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    const hasClient = clients.find((c) => c.id !== clientId);
    if (hasClient) {
      throw new Error("Um cliente com esse email já existe");
    }

    const clientRefPhone = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .where(firestore.FieldPath.documentId(), "!=", clientId)
      .where("phone", "==", client.phone)
      .get();

    if (!clientRefPhone.empty) {
      throw new Error("Um cliente com esse telefone já existe");
    }
   

    const body = {
      ...client,
    };

    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .doc(clientId)
      .update(body);

    return {
      status: StatusServer.success,
      message: "Cliente atualizado com sucesso",
    };
  } catch (error) {
    console.error("Error updating client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function deleteClient(
  companyId: string,
  clientId: string
): Promise<ResponseServerAction> {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .doc(clientId)
      .delete();
    console.log("Client deleted");
    return {
      status: StatusServer.success,
      message: "Cliente deletado com sucesso",
    };
  } catch (error) {
    console.error("Error deleting client", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
