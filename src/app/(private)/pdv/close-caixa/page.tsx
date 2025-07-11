import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { CashClosingDetails } from "./components/cash-closing-details";
import UnderDevelopment from "@/components/developing";

export default async function CashClose() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col ">
      <Header user={user} />
      {user.limit.pdv ? (
        <CashClosingDetails user={user} />
      ) : (
       <UnderDevelopment />
      )}
    </div>
  );
}
