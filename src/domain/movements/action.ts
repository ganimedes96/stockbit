"use server";

import { ResponseServerAction, StatusServer } from "@/api/types";
import {  MovimentsInput, StockMovementType } from "./types";
import { db } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { UpdateStockProduct } from "../product/actions";

export async function createMovement(
  companyId: string,
  moviment: MovimentsInput
): Promise<ResponseServerAction> {
  try {
    const productRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.products)
      .doc(moviment.productId);

    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new Error("Produto nao encontrado");
    }

    const currentStock = productSnap.data()?.openingStock || 0;

    let updatedStock = currentStock;

    if (moviment.type === StockMovementType.STOCK_IN) {
      updatedStock += moviment.quantity;
    } else if (moviment.type === StockMovementType.STOCK_OUT) {
      updatedStock -= moviment.quantity;

      if (updatedStock < 0) {
        throw new Error("Estoque insuficiente para saída");
      }
    }

    await UpdateStockProduct(companyId, moviment.productId, updatedStock);

    const body = {
      ...moviment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.movements)
      .add(body);
    return {
      status: StatusServer.success,
      message: "Movimentação registrada e estoque atualizado",
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
