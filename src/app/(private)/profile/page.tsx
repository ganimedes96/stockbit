import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { UserProfile } from "./components/user-profile";
import { redirect } from "next/navigation";

export default async function MySignature() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Header user={user} />
      <div className="flex flex-col gap-6 p-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Informações</TabsTrigger>
           
          </TabsList>
          <TabsContent value="profile">
            <UserProfile user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
