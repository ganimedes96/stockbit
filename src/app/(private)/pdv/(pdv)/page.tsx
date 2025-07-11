import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { PDVSystem } from "./components/pdv-system";
import UnderDevelopment from "@/components/developing";

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
          <UnderDevelopment />
        )}
      </div>
    </div>
  );
}
