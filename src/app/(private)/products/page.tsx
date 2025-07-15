import { getUser } from "@/domain/user/server";
import { ListProduct } from "./components/list-product";
import { Header } from "@/components/header/header";


export default async function Products() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
     
      <ListProduct companyId={user.company.id} user={user} />
    </>
  );
}
