
import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { HistoryMoviments } from "./components/history-moviments";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { FormMovement } from "./components/form-movement";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductsServer } from "@/domain/product/server";

export default async function Movements() {
  const user = await getUser();

  if (!user) {
    return null;
  }


  return (
    <>
      <Header user={user} />
        <div className="w-full flex items-center justify-end">

        <FormSheet
          title="Nova Movimentação"
          description="Registre uma entrada ou saída de produtos no estoque"
          formComponent={FormMovement}
          formProps={{ user }}
          customButton={
            <Button variant="default" size="sm"  className="m-6 " >
              <Plus size={35}  />
              Registrar movimentação
            </Button>
          }
        />
    
        </div>
      <HistoryMoviments
        companyId={user.company.id}
        user={user}
       
      />
    </>
  );
}
