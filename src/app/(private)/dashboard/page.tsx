import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { Overview } from "./components/overview/overview";
import { AnnualMovements } from "./components/graphics/annual-movements";
import { DistributionByCategory } from "./components/graphics/distribution-by-category";
import { TopProductsInStockValue } from "./components/products-in-stock-value/top-products-in-stock-value";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
      <div className="flex flex-col gap-6 p-6">
         <Overview user={user} />
         <AnnualMovements user={user} />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionByCategory user={user} />
            <TopProductsInStockValue user={user} />
         </div>
      </div>
      ;
    </>
  );
}
