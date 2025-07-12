import { NextResponse } from "next/server";
import { createPdvOrder } from "@/domain/orders/action"; // Importa a sua server action
import { OrderInput } from "@/domain/orders/types";

// Esta função será o nosso endpoint de API que o Service Worker chamará.
export async function POST(request: Request) {
  try {
    // Extrai os dados do pedido e o companyId do corpo da requisição
    const { orderData, companyId } = (await request.json()) as { orderData: OrderInput, companyId: string };

    if (!orderData || !companyId) {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    // Chama a server action real para processar o pedido
    const result = await createPdvOrder(companyId, orderData);

    if (result.status === "success") {
      return NextResponse.json({ message: "Pedido sincronizado com sucesso." }, { status: 200 });
    } else {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
