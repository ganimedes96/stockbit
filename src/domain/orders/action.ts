"use server";

import { db, firestore } from "@/lib/firebase/admin";
import { Collections } from "@/lib/firebase/collections";
import { Order, OrderInput, OrderStatus } from "./types"; // Importe TODOS os seus tipos e enums
import { ResponseServerAction, StatusServer } from "@/api/types";
import { CreateClient } from "../clients/types";
import { StockMovementType } from "../movements/types";
import { Product } from "../product/types";

export async function createOrder(
  companyId: string,
  orderData: OrderInput
): Promise<ResponseServerAction> {
  try {
    // A transação garante que todas as operações abaixo aconteçam, ou nenhuma delas.
    await db.runTransaction(async (transaction) => {
      const companyRef = db.collection(Collections.companies).doc(companyId);

      // =======================================================
      // FASE 1: LEITURA DE DADOS
      // Todas as leituras são feitas aqui, antes de qualquer escrita.
      // =======================================================

      // 1.1: Lê o cliente pelo telefone para ver se já existe.
      const clientsRef = companyRef.collection(Collections.clients);
      const clientQuery = clientsRef
        .where("phone", "==", orderData.customerPhone)
        .limit(1);
      const existingClientSnap = await transaction.get(clientQuery);

      // 1.2: Lê todos os documentos de produto da venda de uma só vez.
      const productRefs = orderData.lineItems.map((item) =>
        companyRef.collection(Collections.products).doc(item.productId)
      );
      // transaction.getAll é otimizado para buscar múltiplos documentos
      const productSnaps = await transaction.getAll(...productRefs);

      // =======================================================
      // FASE 2: VALIDAÇÃO E PREPARAÇÃO DOS DADOS
      // =======================================================

      const productsData: Product[] = [];
      // 2.1: Valida o estoque para cada produto
      for (const [index, productSnap] of productSnaps.entries()) {
        const item = orderData.lineItems[index];
        if (!productSnap.exists) {
          throw new Error(
            `Produto "${item.productName}" (ID: ${item.productId}) não foi encontrado.`
          );
        }
        const productData = productSnap.data() as Product;
        productsData.push(productData); // Guarda os dados do produto para usar depois

        const currentStock = productData.openingStock || 0;
        if (item.quantity > currentStock) {
          throw new Error(
            `Estoque insuficiente para "${productData.name}". Disponível: ${currentStock}`
          );
        }
      }

      // =======================================================
      // FASE 3: OPERAÇÕES DE ESCRITA
      // Todas as escritas (.set, .update) são enfileiradas aqui.
      // =======================================================

      // 3.1: Lógica de Criar/Atualizar Cliente
      let clientId: string;
      const clientData: CreateClient = {
        name: orderData.customerName || "",
        phone: orderData.customerPhone,
        email: orderData.customerEmail || "",
        isFieldAddressed: !!orderData.shippingAddress,
        address: {
          zipCode: orderData.shippingAddress?.zipCode || "",
          street: orderData.shippingAddress?.street || "",
          number: orderData.shippingAddress?.number || "",
          complement: orderData.shippingAddress?.complement || "",
          neighborhood: orderData.shippingAddress?.neighborhood || "",
          city: orderData.shippingAddress?.city || "",
          state: orderData.shippingAddress?.state || "",
        },
        // Define um status padrão
      };

      if (existingClientSnap.empty) {
        const newClientRef = clientsRef.doc();
        transaction.set(newClientRef, {
          ...clientData,
          createdAt: firestore.Timestamp.now(),
        });
        clientId = newClientRef.id;
      } else {
        const existingClientRef = existingClientSnap.docs[0].ref;
        transaction.update(existingClientRef, {
          ...clientData,
          updatedAt: firestore.Timestamp.now(),
        });
        clientId = existingClientRef.id;
      }

      // 3.2: Prepara e escreve o pedido e as movimentações
      const newOrderRef = companyRef.collection(Collections.orders).doc();

      for (const [index, productSnap] of productSnaps.entries()) {
        const item = orderData.lineItems[index];
        const productData = productsData[index];
        const newStock = (productData.openingStock || 0) - item.quantity;

        const newMovementRef = companyRef
          .collection(Collections.movements)
          .doc();
        const movementBody = {
          type: StockMovementType.STOCK_OUT,
          reason: "Venda Catálogo",
          quantity: item.quantity,
          description: `Venda do Pedido ${orderData.orderNumber || "N/A"} `,
          productId: item.productId,
          productName: productData?.name || item.productName,
          productPrice: item.unitPrice,
          sku: productData?.sku || "",
          orderId: newOrderRef.id, // Link para o novo pedido
          createdAt: firestore.Timestamp.now(),
        };

        transaction.update(productSnap.ref, { openingStock: newStock });
        transaction.set(newMovementRef, movementBody);
      }

      const orderBody = {
        ...orderData,
        clientId: clientId, // Usa o ID do cliente (novo ou existente)
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      };

      transaction.set(newOrderRef, orderBody);
    }); // A transação é finalizada e comitada aqui. Se algo falhou, tudo é desfeito.

    return {
      status: StatusServer.success,
      message: "Pedido registrado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao registrar pedido:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message, // Retorna a mensagem de erro específica (ex: "Estoque insuficiente...")
    };
  }
}

export async function updateOrderStatus(
  companyId: string,
  orderId: string,
  status: string
): Promise<ResponseServerAction> {
  try {
    const orderRef = db
      .collection(Collections.companies)
      .doc(companyId)
      .collection(Collections.orders)
      .doc(orderId);

    // Verifica se o pedido existe
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new Error("Pedido não encontrado.");
    }

    // Atualiza o status do pedido
    await orderRef.update({
      status,
      updatedAt: firestore.Timestamp.now(),
    });

    return {
      status: StatusServer.success,
      message: "Status do pedido atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function createPdvOrder(
  companyId: string,
  orderData: OrderInput
): Promise<ResponseServerAction> {
  try {
    // A transação garante que todas as operações sejam atômicas.
    await db.runTransaction(async (transaction) => {
      const companyRef = db.collection(Collections.companies).doc(companyId);

      // --- FASE 1: LEITURA E VALIDAÇÃO DO ESTOQUE ---
      const productRefs = orderData.lineItems.map((item) =>
        companyRef.collection(Collections.products).doc(item.productId)
      );
      const productSnaps = await transaction.getAll(...productRefs);

      for (const [index, productSnap] of productSnaps.entries()) {
        const item = orderData.lineItems[index];
        if (!productSnap.exists) {
          throw new Error(`Produto "${item.productName}" não encontrado.`);
        }
        const productData = productSnap.data() as Product;
        const currentStock = productData.openingStock || 0;
        if (item.quantity > currentStock) {
          throw new Error(`Estoque insuficiente para "${productData.name}".`);
        }
      }

      // --- FASE 2: OPERAÇÕES DE ESCRITA ---

      // Cria uma referência para o novo pedido.
      const newOrderRef = companyRef.collection(Collections.orders).doc();

      // Itera novamente para enfileirar as escritas.
      for (const [index, productSnap] of productSnaps.entries()) {
        const item = orderData.lineItems[index];
        const productData = productSnap.data() as Product;
        const newStock = (productData.openingStock || 0) - item.quantity;

        // Atualiza o estoque do produto.
        transaction.update(productSnap.ref, { openingStock: newStock });

        // Cria a movimentação de estoque.
        const newMovementRef = companyRef
          .collection(Collections.movements)
          .doc();
        const movementBody = {
          type: StockMovementType.STOCK_OUT,
          reason: "Venda PDV",
          quantity: item.quantity,
          productId: item.productId,
          productName: productData.name,
          productPrice: item.unitPrice,
          orderId: newOrderRef.id,
          description: "Venda PDV - " + productData.name,
          createdAt: firestore.Timestamp.now(),
        };
        transaction.set(newMovementRef, movementBody);
      }

      // Prepara o corpo final do pedido.
      const orderBody = {
        ...orderData,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      };

      // Cria o documento do pedido.
      transaction.set(newOrderRef, orderBody);
    });

    return {
      status: StatusServer.success,
      message: "Venda registrada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao registrar venda do PDV:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}

export async function cancelOrderPdv(
  companyId: string,
  orderId: string
): Promise<ResponseServerAction> {
  try {
    await db.runTransaction(async (transaction) => {
      const companyRef = db.collection(Collections.companies).doc(companyId);
      const orderRef = companyRef.collection(Collections.orders).doc(orderId);

      // Verifica se o pedido existe
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        throw new Error("Pedido nao encontrado.");
      }

      const orderData = orderSnap.data() as Order;

      // Atualiza o status do pedido
      await orderRef.update({
        status: OrderStatus.Cancelled,
        updatedAt: firestore.Timestamp.now(),
      });

      // Atualiza o estoque dos produtos
      const productRefs = orderData.lineItems.map((item) =>
        companyRef.collection(Collections.products).doc(item.productId)
      );
      const productSnaps = await transaction.getAll(...productRefs);

      for (const [index, productSnap] of productSnaps.entries()) {
        const item = orderData.lineItems[index];
        const productData = productSnap.data() as Product;
        const currentStock = productData.openingStock || 0;
        const newStock = currentStock + item.quantity;

        // Atualiza o estoque do produto.
        transaction.update(productSnap.ref, { openingStock: newStock });

        // Cria a movimentação de estoque.
        const newMovementRef = companyRef
          .collection(Collections.movements)
          .doc();
        const movementBody = {
          type: StockMovementType.STOCK_IN,
          reason: "Cancelamento PDV",
          quantity: item.quantity,
          productId: item.productId,
          productName: productData.name,
          productPrice: item.unitPrice,
          orderId: orderId,
          description: "Cancelamento PDV - " + productData.name,
          createdAt: firestore.Timestamp.now(),
        };
        transaction.set(newMovementRef, movementBody);
      }
    });

    return {
      status: StatusServer.success,
      message: "Pedido cancelado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    const err = error as Error;
    return {
      status: StatusServer.error,
      message: err.message,
    };
  }
}
