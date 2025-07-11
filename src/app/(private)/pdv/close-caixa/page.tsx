import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { CashClosingDetails } from "./components/cash-closing-details";

export default async function CashClose() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col ">
      <Header user={user} />
      {user.limit.pdv ? (
        <CashClosingDetails user={user} />
      ) : (
        <div>
          <h1>Seu plano atual nao permite acesso ao PDV.</h1>
          <p>
            Por favor, entre em contato com o suporte para obter mais
            informacoes.
          </p>
        </div>
      )}
    </div>
  );
}
