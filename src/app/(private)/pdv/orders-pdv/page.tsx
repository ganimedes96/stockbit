import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { ListPdvOrders } from "./components/list-orders-pdv";
import UnderDevelopment from "@/components/developing";


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
      <UnderDevelopment />
    )}

    </>
  );
}