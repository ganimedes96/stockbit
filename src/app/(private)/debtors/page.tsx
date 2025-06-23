import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { DebtorsList } from "./components/debdors-list";

export default async function Debtors() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (<>
        <Header user={user} />
        <DebtorsList user={user} />
  </>);
}
