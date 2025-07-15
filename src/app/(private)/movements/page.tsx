import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { HistoryMoviments } from "./components/history-moviments";


export default async function Movements() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />

      <HistoryMoviments user={user} />
    </>
  );
}
