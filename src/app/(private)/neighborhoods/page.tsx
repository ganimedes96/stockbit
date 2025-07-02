import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { NeighborhoodsList } from "./components/neighborhoods-list";

export default async function NeighborhoodsPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <NeighborhoodsList user={user} />
    </>
  );
}
