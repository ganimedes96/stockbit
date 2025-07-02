import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { OrdersList } from "./components/orders-list";

export default async function Orders() {
     const user = await getUser();
    
      if (!user) {
        return null;
      }
    
  return (
    < >
    <Header user={user} />

    <OrdersList user={user} />

    </>
  );
}