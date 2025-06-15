"use server";
import { db, storage } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { ResponseServerAction, StatusServer } from "@/api/types";
import { Product, ProductInput, ProductUpdateInput } from "./types";
import { compressImage } from "@/utils/compressFile/compress";
import { randomUUID } from "crypto";
import { getDownlaodURLFromPath } from "@/utils/store-config/config";

export async function CreateProduct(
  company: string,
  product: ProductInput
): Promise<ResponseServerAction> {
  try {

  const file = product.photo as File;

    const hasFile = file instanceof File && file.size > 0;
    let imagePath = null;
    if (hasFile) {
      const compressedBuffer = await compressImage(file);
      const storageRef = storage.file(`products/${file.name}/${randomUUID()}`);
      await storageRef.save(compressedBuffer);
      const path = storageRef.name;
      imagePath = await getDownlaodURLFromPath(path);
    }

    const body: ProductInput = {
      name: product.name,
      categoryId: product.categoryId,
      sku: product.sku ?? "",
      photo: imagePath ?? "",
      description: product.description ? product.description : "",
      isActive: product.isActive,
      minimumStock: product.minimumStock,
      openingStock: product.openingStock,
      purchasePrice: product.purchasePrice,
      supplierId: product.supplierId ?? "",
      salePrice: product.salePrice,
      createdAt: new Date(),
    };

    await db
      .collection(Collections.companies)
      .doc(company)
      .collection(Collections.products)
      .add(body);
    return {
      status: StatusServer.success,
      message: "Produto criado com sucesso",
    };
  } catch (error) {
    console.error("Error creating product", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function UpdateProduct(
  company: string,
  product: ProductUpdateInput
): Promise<ResponseServerAction> {
  try {
    const body: ProductUpdateInput = {
      id: product.id,
      name: product.name,
      sku: product.sku ?? "",
      categoryId: product.categoryId,
      photo: product.photo ?? "",
      description: product.description ? product.description : "",
      isActive: product.isActive,
      minimumStock: product.minimumStock,
      openingStock: product.openingStock,
      purchasePrice: product.purchasePrice,
      supplierId: product.supplierId ?? "",
      salePrice: product.salePrice,
      updatedAt: new Date(),
    };

    await db
      .collection(Collections.companies)
      .doc(company)
      .collection(Collections.products)
      .doc(product.id)
      .update(body);
    return {
      status: StatusServer.success,
      message: "Produto atualizado com sucesso",
    };
  } catch (error) {
    console.error("Error updating product", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function DeleteProduct(
  company: string,
  productId: string
): Promise<ResponseServerAction> {
  try {
    await db
      .collection(Collections.companies)
      .doc(company)
      .collection(Collections.products)
      .doc(productId)
      .delete();
    return {
      status: StatusServer.success,
      message: "Produto deletado com sucesso",
    };
  } catch (error) {
    console.error("Error deleting product", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}


export async function UpdateStockProduct(companyId: string, productId: string, stock: number) {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.products)
      .doc(productId)
      .update({ openingStock: stock });
    return {
      status: StatusServer.success,
      message: "Estoque atualizado com sucesso",
    };
  } catch (error) {
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}


export async function UpdateSatusProduct(
  companyId: string,
  productId: string,
  status: boolean
) {
  try {
    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.products)
      .doc(productId)
      .update({ isActive: status });
    return {
      status: StatusServer.success,
      message: "Produto atualizado com sucesso",
    };
  } catch (error) {
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}


