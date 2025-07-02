
import { ClientList } from "./components/client-list";
import { getUser } from "@/domain/user/server";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { ClientForm } from "./components/client-form";
import { Plus } from "lucide-react";
import { Header } from "@/components/header/header";


export default async function Clients() {
  const user = await getUser();
 
  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <div className="p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center max-sm:gap-6">
          <p className="max-sm:hidden text-muted-foreground max-sm:text-center">
            Gerencie e visualize seus clientes cadastrados.
          </p>
          <p className="sm:hidden text-muted-foreground max-sm:text-center">
            Clientes Cadastrados
          </p>
          <div className="block sm:hidden">
            <FormSheet
              title="Adicionar cliente"
              description="Adicione um novo cliente ao seu sistema."
              formComponent={ClientForm}
              formProps={{ companyId: user.company.id }}
              customButton={
                <Plus
                  size={20}
                  className="z-50 fixed bottom-10 right-10 bg-muted rounded-full  w-14 h-14 p-3 "
                />
              }
            />
          </div>
          <div className="hidden sm:block">
            <FormSheet
              title="Adicionar cliente"
              description="Adicione um novo cliente ao seu sistema."
              formComponent={ClientForm}
              formProps={{ companyId: user.company.id }}
            />
          </div>
        </div>
        <ClientList
          companyId={user.company.id}
          role={user.role}
        />
      </div>
    </>
  );
}
