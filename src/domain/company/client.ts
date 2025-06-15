"use client"
import { Collections } from "@/lib/firebase/collections";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { CreateUser, User } from "../user/types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { StatusServer } from "@/api/types";

export async function createUserCompany(body: CreateUser) {
  try {
    const create = await createUserWithEmailAndPassword(
      auth,
      body.email,
      body.password
    );
    await setDoc(doc(db, Collections.companies, create.user.uid), {
      ...body,
      id: create.user.uid,
      company: {
        ...body.company,
        id: create.user.uid,
      },
    });
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error;
  }
}

export async function getCompanyById(companyId: string) {
  try {
    const companyRef = doc(db, Collections.companies, companyId);
    const companyDoc = await getDoc(companyRef);
    if (!companyDoc.exists) return null;
    const company = companyDoc.data();
    if (!company) return null;
    return {
      ...company,
      createdAt: company.createdAt.toDate(),
    } as User;
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao buscar empresa");
  }
}


export async function getCompanyByLink(slug: string) {
  try {
    const companyRef = doc(db, Collections.companies, slug);
    const companyDoc = await getDoc(companyRef);
    
    const company = companyDoc.data();
    if (!company) {
      return {
        status: StatusServer.error,
        message: "Empresa nao encontrada",
      };
    }
    return {
      status: StatusServer.success,
      message: "Empresa encontrada",
      company,
    };
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return {
      status: StatusServer.error,
      message: "Erro ao buscar empresa",
    };
  }
}