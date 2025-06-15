"use server";
import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { CategoryInput, CategoryUpdateInput } from "./types";


export async function CreateCategory(
  companyId: string,
  category: CategoryInput
): Promise<ResponseServerAction> {
  try {
    const categoryAlreadyExists = await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.categories)
      .where("name", "==", category.name)
      .get();

    if (categoryAlreadyExists.docs.length > 0) {
      return {
        status: StatusServer.error,
        message: "Categoria já existe",
      };
    }

    const body = {
      name: category.name,
      description: category.description ? category.description : "",
      createdAt: new Date(),
    };

    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.categories)
      .add(body);
    return {
      status: StatusServer.success,
      message: "Categoria criada com sucesso",
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


export async function DeleteCategory(
  companyId: string,
  categoryId: string
): Promise<ResponseServerAction> {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.categories)
      .doc(categoryId)
      .delete();
    return {
      status: StatusServer.success,
      message: "Categoria deletada com sucesso",
    };
  } catch (error) {
    console.error("Error deleting category", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}


export async function UpdateCategory(
  companyId: string,
  category: CategoryUpdateInput
) {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.categories)
      .doc(category.id)
      .update(category);
    return {
      status: StatusServer.success,
      message: "Categoria atualizada com sucesso",
    };
  } catch (error) {
    console.error("Error updating category", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}