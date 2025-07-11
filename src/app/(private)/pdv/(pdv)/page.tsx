import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { PDVSystem } from "./components/pdv-system";

export default async function PDV() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />

      <div className="flex-1 flex">
        {user.limit.pdv ? (
          <PDVSystem user={user} />
        ) : (
          <div>
            <h1>Seu plano atual não permite acesso ao PDV.</h1>
            <p>
              Por favor, entre em contato com o suporte para obter mais
              informações.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
