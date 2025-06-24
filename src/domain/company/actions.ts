/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { CreateUser } from "../user/types";
import { StatusServer } from "@/api/types";
import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { handleFirebaseAuthError } from "@/lib/firebase/handle-firebase-auth-error";
import { auth } from "firebase-admin";

export async function CreateCompany(data: Partial<CreateUser>) {
  try {
    const create = await auth().createUser({
      email: data.email,
      password: data.password,
    });
    const body = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      company: {
        ...data.company,
        cnpj: data.company?.cnpj ?? "",
      },
      role: "admin",
      subscription: {
        isSubscribed: false,
        status: "active",
        nextCharge: 0,
        price: 0,
        start: new Date().toISOString(),
        plan: "Teste",
        cycle: "Modo teste",
      },
      limit: {
        products: 0,
        services: 0,
        dashboard: "",
        employees: 0,
        reports: 0,
      },
      isTrial: true,
      emailVerified: false,
      customerId: "",
      active: true,
    };


    await db
      .collection(Collections.companies)
      .doc(create.uid)
      .set({
        ...body,
        id: create.uid,
        company: {
          ...body.company,
          id: create.uid,
        },
        createdAt: firestore.Timestamp.now(),
      });
    return {
      status: StatusServer.success,
      message: "Usuário criado com sucesso",
    };
  } catch (error: any) {
    console.error("Erro ao criar usuário:", {
      code: error?.code,
      message: error?.message,
      errorInfo: error?.errorInfo,
    });

    return {
      status: StatusServer.error,
      message: handleFirebaseAuthError(error),
    };
  }
}
