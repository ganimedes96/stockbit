import { getUser } from "@/domain/user/server";
import { ListProduct } from "./components/list-product";
import { Header } from "@/components/header/header";
import { FormSheet } from "@/components/form/containers/form-sheet";
import FormProduct from "./create/form-product";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function Products() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <div className="w-full flex items-center justify-end px-6 pt-6">
        <FormSheet
          title="Novo Produto"
          description="Registre um novo produto no estoque"
          formComponent={FormProduct}
          formProps={{ user }}
          customButton={
            <Button
              variant="default"
              size="sm"
              className="flex items-center justify-center w-full  md:max-w-40"
            >
              <Plus size={35} />
              Registrar produto
            </Button>
          }
        />
      </div>
      <ListProduct companyId={user.company.id} user={user} />
    </>
  );
}
