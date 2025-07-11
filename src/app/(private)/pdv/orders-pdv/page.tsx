import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { ListPdvOrders } from "./components/list-orders-pdv";


export default async function OrdersPdv() {
     const user = await getUser();
    
      if (!user) {
        return null;
      }
    
  return (
    < >
    <Header user={user} />

    {user.limit.pdv ? (
      <ListPdvOrders user={user} />
    ) : (
      <div>
        <h1>Seu plano atual nao permite acesso ao PDV.</h1>
        <p>Por favor, entre em contato com o suporte para obter mais informacoes.</p>
      </div>
    )}

    </>
  );
}