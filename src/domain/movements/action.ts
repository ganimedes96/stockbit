"use server";

import { ResponseServerAction, StatusServer } from "@/api/types";
import { MovimentsInput, MovimentsUpdate, StockMovementType } from "./types";
import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { UpdateStockProduct } from "../product/actions";

export async function createMovement(
  companyId: string,
  moviment: MovimentsInput
): Promise<ResponseServerAction> {
  try {
    // 1. Inicia uma transação. Toda a lógica de leitura e escrita acontecerá aqui dentro.
    await db.runTransaction(async (transaction) => {
      // 2. Referência ao documento do produto
      const productRef = db
        .collection(Collections.companies)
        .doc(companyId)
        .collection(Collections.products)
        .doc(moviment.productId);

      // 3. Lê o documento do produto DENTRO da transação
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists) {
        throw new Error("Produto não encontrado");
      }

      const productData = productSnap.data();
      const currentStock = productData?.openingStock || 0;

      // 4. Validação de estoque (sem alterações)
      if (
        moviment.type === StockMovementType.STOCK_OUT &&
        moviment.quantity > currentStock
      ) {
        throw new Error("Estoque insuficiente para esta saída");
      }

      // 5. Copiar (Denormalizar) os dados do produto para a movimentação
      // Isso garante a consistência histórica dos seus relatórios.
      const movementBody = {
        ...moviment, // Os dados do input (productId, quantity, type, description...)
        productName: productData?.name || "Nome não encontrado", // "Congela" o nome do produto
        sku: productData?.sku || "SKU nao encontrado",
        productPrice: productData?.salePrice || 0, // "Congela" o preço de custo/venda
        createdAt: firestore.Timestamp.now(), // Adiciona a data de criação no servidor
      };

      // 6. Calcular o novo estoque (sem alterações)
      const updatedStock =
        moviment.type === StockMovementType.STOCK_IN
          ? currentStock + moviment.quantity
          : currentStock - moviment.quantity;

      // 7. Referência para o NOVO documento de movimentação
      const newMovementRef = db
        .collection(Collections.companies)
        .doc(companyId)
        .collection(Collections.movements)
        .doc(); // Cria uma referência com ID automático

      // 8. Realizar as duas escritas DENTRO da transação
      // Primeiro, atualiza o estoque do produto existente
      transaction.update(productRef, { openingStock: updatedStock });
      // Segundo, cria o novo registro de movimentação
      transaction.set(newMovementRef, movementBody);
    });

    // Se a transação chegar até aqui sem erros, significa que TUDO funcionou.
    return {
      status: StatusServer.success,
      message: "Movimentação registrada e estoque atualizado com sucesso!",
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

export async function updatedMovement(
  companyId: string,
  moviment: MovimentsUpdate
) {
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

    if (
      moviment.type === StockMovementType.STOCK_OUT &&
      moviment.quantity > currentStock
    ) {
      throw new Error("Estoque insuficiente para saída");
    }

    const updatedStock =
      moviment.type === StockMovementType.STOCK_IN
        ? currentStock + moviment.quantity
        : currentStock - moviment.quantity;

    await UpdateStockProduct(companyId, moviment.productId, updatedStock);

    const body = {
      ...moviment,
      updatedAt: new Date(),
    };

    await db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.movements)
      .doc(moviment.id)
      .update(body);

    return {
      status: StatusServer.success,
      message: "Movimentação atualizada com sucesso",
    };
  } catch (error) {
    console.error("Error updating movement", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
