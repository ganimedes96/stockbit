import { getCompanyOwnerBySlug } from "@/domain/company/server";
import { CatalogList } from "./components/catalog-list";
import { Header } from "./components/header";

export default async function Catalog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  
  const { slug } = await params;
  const company = await getCompanyOwnerBySlug(slug);
  if (!company) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-lg">Pagina nao encontrada</p>
        </div>
      </div>
    );
  }
  if (!company.isTrial && !company.subscription.isSubscribed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-lg space-y-4">
          <h1 className="text-3xl font-bold">Serviço indisponível</h1>
          <p className="text-muted-foreground">
            Esta empresa não possui uma assinatura ativa no momento. O
            agendamento está temporariamente indisponível.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header user={company} />
      <div className="flex items-center justify-center p-6">
        <CatalogList user={company} />
      </div>
    </>
  );
}
