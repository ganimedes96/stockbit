"use client";
import {
  collection,
  getDocs,
  orderBy,
  query,
  getDoc,
  doc,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Collections } from "@/lib/firebase/collections";
import type { Client } from "./types";

export async function getClients(companyId: string) {
  const clientsRef = collection(
    db,
    Collections.companies,
    companyId,
    Collections.clients
  );
  const q = query(clientsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      ...data,
      birthday: data.birthday ? data.birthday.toDate() : "",
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      id: doc.id,
    } as Client;
  });
}


export async function getClientById(companyId: string, clientId: string) {
  const clientRef = doc(
    db,
    Collections.companies,
    companyId,
    Collections.clients,
    clientId
  );
  const clientDoc = await getDoc(clientRef);
  if (!clientDoc.exists()) {
    return null;
  }
  return { ...clientDoc.data(), id: clientDoc.id } as Client;
}

export async function getTotalClients(companyId: string) {
  const clientsRef = collection(
    db,
    Collections.companies,
    companyId,
    Collections.clients
  );
  const q = query(clientsRef);
  const querySnapshot = await getCountFromServer(q);
  return querySnapshot.data().count;
}

export async function getClientByPhone(
  companyId: string,
  phone: string
): Promise<Client | null> {
  const clientsRef = collection(
    db,
    Collections.companies,
    companyId,
    Collections.clients
  );
  const q = query(clientsRef, where("phone", "==", phone));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const client = snapshot.docs[0].data();

  


  return {
    ...client,
    createdAt: client.createdAt.toDate(),
    birthday: client.birthday ? client.birthday.toDate() : '',
    updatedAt: client.updatedAt?.toDate(),
    id: snapshot.docs[0].id,
  } as Client;
}

