"use server";
import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { SupplierInput, SupplierUpdateInput } from "./types";

export async function CreateSupplier(
  companyId: string,
  supplier: SupplierInput
): Promise<ResponseServerAction> {
  try {
    const supplierAlreadyExists = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.suppliers)
      .where("name", "==", supplier.name)
      .get();

    if (supplierAlreadyExists.docs.length > 0) {
      return {
        status: StatusServer.error,
        message: "Fornecedor já existe",
      };
    }

    const body: SupplierInput = {
      name: supplier.name,
      email: supplier.email ?? "",
      type: supplier.type,
      status: supplier.status ?? true,
      legalName: supplier.legalName ?? "",
      document: supplier.document ?? "",
      defaultPaymentTerms: supplier.defaultPaymentTerms ?? "30 dias",
      description: supplier.description ?? "",
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
      createdAt: new Date(),
    };

    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.suppliers)
      .add(body);

    return {
      status: StatusServer.success,
      message: "Fornecedor criado com sucesso",
    };
  } catch (error) {
    console.error("Error creating supplier", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function UpdateSupplier(companyId: string, supplier: SupplierUpdateInput) {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.suppliers)
      .doc(supplier.id)
      .update(supplier);
    return {
      status: StatusServer.success,
      message: "Fornecedor atualizado com sucesso",
    };
  } catch (error) {
    console.error("Error updating supplier", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function DeleteSupplier(
  companyId: string,
  supplierId: string
): Promise<ResponseServerAction> {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.suppliers)
      .doc(supplierId)
      .delete();

    return {
      status: StatusServer.success,
      message: "Fornecedor deletado com sucesso",
    };
  } catch (error) {
    console.error("Error deleting supplier", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function updateSupplierStatus(
  companyId: string,
  supplierId: string,
  status: boolean): Promise<ResponseServerAction> {
  try {
    const supplierRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.suppliers)
      .doc(supplierId);

    const supplierExists = supplierRef.get();
    if (!supplierExists) {
      return {
        status: StatusServer.error,
        message: "Fornecedor nao encontrado",
      };
    } 

    await supplierRef.update({
      status,
    });

    return {
      status: StatusServer.success,
      message: "Status do fornecedor atualizado com sucesso",
    };

  } catch (error) {
    console.error("Error updating supplier status", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
