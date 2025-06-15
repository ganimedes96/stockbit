import UnderDevelopment from "@/components/developing";
import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";

export default async function Reports() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <div>
        <UnderDevelopment />
      </div>
      ;
    </>
  );
}
