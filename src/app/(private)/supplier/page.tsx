import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { SuppliersList } from "./components/suppliers-list";

export default async function Supplier() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <SuppliersList user={user} />
    </>
  );
}
