import * as XLSX from "xlsx";
import { Product } from "@/domain/product/types";

export function exportProductsToExcel(
  products: Product[],
  categoryMap: Map<string, string>
) {
  const data = products.map((p) => ({
    SKU: p.sku || "-",
    Nome: p.name,
    Categoria: categoryMap.get(p.categoryId) || "SEM CATEGORIA",
    "Preço de Custo": p.purchasePrice,
    "Preço de Venda": p.salePrice,
    Estoque: p.openingStock,
    "Estoque Mínimo": p.minimumStock,
    "Data de Vencimento": p.hasAnExpirationDate ? p.expirationDate : "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");

  XLSX.writeFile(wb, "produtos.xlsx");
}
