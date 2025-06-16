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
      throw new Error("Produto não encontrado");
    }

    const currentStock = productSnap.data()?.openingStock || 0;

    // Verifica se está tentando retirar mais do que tem em estoque
    if (
      moviment.type === StockMovementType.STOCK_OUT &&
      moviment.quantity > currentStock
    ) {
      throw new Error("Estoque insuficiente para saída");
    }

    // Atualiza estoque de acordo com o tipo de movimentação
    const updatedStock =
      moviment.type === StockMovementType.STOCK_IN
        ? currentStock + moviment.quantity
        : currentStock - moviment.quantity;

    // Atualiza o estoque do produto
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
    console.error("Error creating movement", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
