import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { Client } from "./types";


export async function getClients(companyId: string) {
  try {
    const clients = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .orderBy("createdAt", "desc")
      .get()
      .then((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            createdAt: data.createdAt.toDate(),
            id: doc.id,
          };
        });
      });
    return clients as Client[];
  } catch (error) {
    throw error;
  }
}

export async function getClientById(companyId: string, id: string) {
  try {
    const client = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .doc(id)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          throw new Error("Cliente não encontrado");
        }
        return {
          ...doc.data(),
          id: doc.id,
        };
      });
    return client as Client;
  } catch (error) {
    throw error;
  }
}

export async function getTotalClients(companyId: string) {
  try {
    const clientsRef = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.clients)
      .count()
      .get();

    const total = clientsRef.data().count;
    return total;
  } catch (error) {
    throw error;
  }
}

