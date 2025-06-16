import {getMovements} from "../movements/client"
import { StockMovementType } from "../movements/types";
import {getCategories} from "../category/client"
import {getProducts} from "../product/client"
import { TopProduct } from "./types";

const COLORS = [
  "#3b82f6", // azul
  "#10b981", // verde
  "#f59e0b", // amarelo
  "#ef4444", // vermelho
  "#8b5cf6", // roxo
  "#ec4899", // rosa
  "#22d3ee", // ciano
];
const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];
export const getMetricsMovements = async (companyId: string, year: number) => {
  const movements = await getMovements(companyId);

  const data = monthNames.map((month, index) => {
   
    const movementsOfMonth = movements.filter((movement) => {
      const date = new Date(movement.createdAt);
      return (
        date.getFullYear() === year &&
        date.getMonth() === index 
      );
    });

    const totalIn = movementsOfMonth
      .filter((m) => m.type === StockMovementType.STOCK_IN)
      .reduce((acc, m) => acc + m.quantity, 0);

    const totalOut = movementsOfMonth
      .filter((m) => m.type === StockMovementType.STOCK_OUT)
      .reduce((acc, m) => acc + m.quantity, 0);

    return {
      name: month,
      in: totalIn,
      out: totalOut,
    };
  });

  return data;
};



export const getMetricsByCategory = async (companyId: string) => {
  const categories = await getCategories(companyId);
  const products = await getProducts(companyId);

  const totalProducts = products.length;

  const categoryData = categories.map((category, index) => {
    const productsInCategory = products.filter(
      (product) => product.categoryId === category.id
    );

    const value = ((productsInCategory.length / totalProducts) * 100).toFixed(2);

    return {
      name: category.name,
      value: Number(value), // percentual
      color: COLORS[index % COLORS.length],
    };
  });

  return categoryData;
};


export const getLowStockProducts = async (companyId: string) => {
  const products = await getProducts(companyId);

  const lowStockProducts = products
    .filter((product) => product.openingStock < product.minimumStock)
    .map((product) => ({
      name: product.name,
      sku: product.sku,
      openingStock: product.openingStock,
      minimumStock: product.minimumStock,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
    }));

  return lowStockProducts;
};


export async function getTopProductsInStockValue(companyId: string): Promise<TopProduct[]> {
  const products = await getProducts(companyId);

  const productWithStockValue = products
    .map((product) => {
      const totalValue = product.openingStock * product.salePrice; // preço de venda
      const margin =
        product.purchasePrice > 0
          ? Number((((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1))
          : 0;

      return {
        name: product.name,
        sku: product.sku ?? "", // garante que sku seja sempre string
        stock: product.openingStock,
        value: Number(totalValue.toFixed(2)),
        margin,
      };
    })
    .filter((p) => p.stock > 0) // ignora produtos sem estoque
    .sort((a, b) => b.value - a.value) // ordena por valor total em estoque
    .slice(0, 10); // top 10 (ajuste como preferir)

  return productWithStockValue;
}



export async function getOverviewStock(companyId: string) {
  try {
    const products = await getProducts(companyId);

    const totalValue = products.reduce((acc, product) => {
      return acc + product.openingStock * product.purchasePrice;
    }, 0);

    const totalProducts = products.length;

    const lowStockCount = products.filter(
      (product) => product.openingStock < product.minimumStock
    ).length;

    const totalMargin = products.reduce((acc, product) => {
      if (product.purchasePrice > 0) {
        const margin =
          ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100;
        return acc + margin;
      }
      return acc;
    }, 0);

    const averageMargin =
      products.length > 0
        ? Number((totalMargin / products.length).toFixed(1))
        : 0;

    return {
      totalValue: Number(totalValue),
      totalProducts,
      lowStockCount,
      averageMargin,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao calcular overview do estoque");
  }
}

