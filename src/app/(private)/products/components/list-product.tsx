"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProductList,
  useUpdateStatusProduct,
} from "@/domain/product/queries";
import { AlertTriangle, Filter, Plus, Search, SquarePen } from "lucide-react";

import { useMemo, useState } from "react";
import { TableSkeleton } from "./card-product-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/domain/product/types";
import { Badge } from "@/components/ui/badge";
import { useCategoryList } from "@/domain/category/queries";

import { ProductDelete } from "./product-delete";
import Image from "next/image";
import ImageDefault from "@/assets/stockbit-v2.png";
import UpdateFormProduct from "../update/update-form-product";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { User } from "@/domain/user/types";
import { formatCurrency } from "@/utils/text/format";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { StatusSwitch } from "@/components/status-switch";
import FormProduct from "../create/form-product";
import { exportProductsToExcel } from "./helpers";
import { ProductValidity } from "./product-validity";

interface ListProductProps {
  user: User;
}

export function ListProduct({ user }: ListProductProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const { data: products, isLoading } = useProductList(user.company.id);
  const { data: categories } = useCategoryList(user.company.id);
  const { mutate, isPending } = useUpdateStatusProduct(user.company.id);
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) {
      return { variant: "danger" as const, label: "Esgotado" };
    }
    if (stock <= minStock) {
      return { variant: "warning" as const, label: "Estoque Baixo" };
    }
    return { variant: "success" as const, label: "Disponível" };
  };

  const categoryMap = useMemo(() => {
    if (!categories) {
      return new Map<string, string>();
    }

    return categories.reduce((map, category) => {
      map.set(category.id, category.name);
      return map;
    }, new Map<string, string>());
  }, [categories]);

  const filteredProducts: Product[] = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;

      let matchesStockStatus = true;

      const now = new Date();
      const soonThreshold = new Date();
      soonThreshold.setDate(now.getDate() + 7);

      if (stockStatusFilter === "low") {
        matchesStockStatus =
          product.openingStock <= product.minimumStock &&
          product.openingStock > 0;
      } else if (stockStatusFilter === "out") {
        matchesStockStatus = product.openingStock <= 0;
      } else if (stockStatusFilter === "normal") {
        matchesStockStatus = product.openingStock > product.minimumStock;
      } else if (stockStatusFilter === "expired") {
        matchesStockStatus =
          !!product.expirationDate && product.expirationDate < now;
      } else if (stockStatusFilter === "expiringSoon") {
        matchesStockStatus =
          !!product.expirationDate &&
          product.expirationDate >= now &&
          product.expirationDate <= soonThreshold;
      }

      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [products, debouncedSearchQuery, selectedCategory, stockStatusFilter]);

  const handleMutate = (data: { id: string; status: boolean }) => {
    mutate({
      productId: data.id,
      status: data.status,
    });
  };

  const expiredCount =
    filteredProducts?.filter(
      (p) => p.expirationDate && p.expirationDate < new Date()
    ).length || 0;

  return (
    <div className="flex flex-col gap-4 p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nome ou descrição..."
            icon={<Search className="h-4 w-4" />}
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>

              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={stockStatusFilter}
            onValueChange={setStockStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status de estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="normal">Estoque normal</SelectItem>
              <SelectItem value="low">Estoque baixo</SelectItem>
              <SelectItem value="out">Esgotado</SelectItem>
              <SelectItem value="expiringSoon">Próximos de vencer</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setStockStatusFilter("all");
            }}
          >
            Limpar filtros
          </Button>
        </CardContent>
      </Card>

      <div className="my-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total de Produtos</p>
          <p className="text-2xl font-bold text-blue-900">
            {filteredProducts?.length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Valor Total (Custo)</p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(
              filteredProducts?.reduce(
                (acc, p) => acc + p.purchasePrice * p.openingStock,
                0
              )
            )}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-orange-600">Produtos com Estoque Baixo</p>
          <p className="text-2xl font-bold text-orange-900">
            {
              filteredProducts?.filter((p) => p.openingStock <= p.minimumStock)
                .length
            }
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Produtos Vencidos</p>
          <p className="text-2xl font-bold text-red-900">{expiredCount}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => exportProductsToExcel(filteredProducts, categoryMap)}
        >
          Exportar Excel
        </Button>

        <FormSheet
          title="Novo Produto"
          description="Registre um novo produto no estoque"
          formComponent={FormProduct}
          formProps={{ user }}
          customButton={
            <Button
              variant="default"
              size="sm"
              className="flex items-center justify-center w-full md:max-w-40"
            >
              <Plus size={35} />
              Registrar produto
            </Button>
          }
        />
      </div>
      <Card>
        <ScrollArea className="max-h-[700px] overflow-auto">
          <Table>
            <TableHeader className=" bg-sidebar sticky top-0">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Imagem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço de Custo</TableHead>
                <TableHead>Preço de Venda</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="text-center">Validade</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={9} rows={10} />
              ) : filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts?.map((product: Product) => {
                  const stockStatus = getStockStatus(
                    product.openingStock,
                    product.minimumStock
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm max-w-[90px] truncate">
                        {product?.sku || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Image
                          src={
                            typeof product.photo === "string" ||
                            typeof product.photo === "undefined"
                              ? product.photo || ImageDefault
                              : ImageDefault
                          }
                          alt={product.name}
                          width={50}
                          height={50}
                          className="object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium max-w-[90px] truncate">
                            {product.name}
                          </p>
                          {product.openingStock <= product.minimumStock && (
                            <div className="flex items-center text-orange-600 text-xs mt-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Estoque baixo
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {categoryMap.get(product.categoryId)?.toUpperCase() ||
                          "SEM CATEGORIA"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(product.purchasePrice)}
                      </TableCell>
                      <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={
                              product.openingStock <= product.minimumStock
                                ? "text-orange-600 font-medium"
                                : ""
                            }
                          >
                            {product.openingStock}
                          </span>
                          <span className="text-gray-400 text-sm">
                            / {product.minimumStock} mín
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.hasAnExpirationDate &&
                        product.expirationDate ? (
                          <ProductValidity date={product.expirationDate} />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${
                            stockStatus.variant === "warning"
                              ? "bg-orange-500 hover:bg-orange-800"
                              : stockStatus.variant === "success"
                              ? "bg-green-500 hover:bg-green-800"
                              : "bg-red-500 hover:bg-red-800"
                          } text-black`}
                        >
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* <Button variant="ghost" icon={<SquarePen />}></Button> */}
                        <div className="flex items-center justify-center gap-3">
                          <StatusSwitch
                            entity={product}
                            mutate={handleMutate}
                            isPending={isPending}
                            statusKey={"isActive"}
                          />

                          <FormSheet
                            title="Editar Produto"
                            description="Editar produto no estoque"
                            formComponent={UpdateFormProduct}
                            formProps={{ product, user }}
                            customButton={
                              <Button size={"icon"} variant="outline">
                                <SquarePen />
                              </Button>
                            }
                          />
                          <ProductDelete
                            product={product}
                            companyId={user.company.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Nenhum produto encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </Card>
    </div>
  );
}
