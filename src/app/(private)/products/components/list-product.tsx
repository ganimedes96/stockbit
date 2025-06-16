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
import { useProductList } from "@/domain/product/queries";
import { AlertTriangle, Filter, Search, SquarePen } from "lucide-react";

import { useState } from "react";
import { CardProductSkeleton } from "./card-product-skeleton";
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

interface ListProductProps {
  companyId: string;
  user: User;
}

export function ListProduct({ companyId, user }: ListProductProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const { data: products, isLoading } = useProductList(companyId);
  const { data: categories } = useCategoryList(companyId);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) {
      return { variant: "danger" as const, label: "Esgotado" };
    }
    if (stock <= minStock) {
      return { variant: "warning" as const, label: "Estoque Baixo" };
    }
    return { variant: "success" as const, label: "Disponível" };
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;

    let matchesStockStatus = true;
    if (stockStatusFilter === "all") {
      matchesStockStatus = true;
    } else if (stockStatusFilter === "low") {
      matchesStockStatus =
        product.openingStock <= product.minimumStock &&
        product.openingStock > 0;
    } else if (stockStatusFilter === "out") {
      matchesStockStatus = product.openingStock <= 0;
    } else if (stockStatusFilter === "normal") {
      matchesStockStatus = product.openingStock > product.minimumStock;
    }

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

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

      <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardProductSkeleton />
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <ScrollArea className="max-h-[700px] overflow-auto">
            <Table>
              <TableHeader className=" bg-zinc-800 sticky top-0">
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço de Custo</TableHead>
                  <TableHead>Preço de Venda</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product: Product) => {
                  const stockStatus = getStockStatus(
                    product.openingStock,
                    product.minimumStock
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
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
                          <p className="font-medium">{product.name}</p>
                          {product.openingStock <= product.minimumStock && (
                            <div className="flex items-center text-orange-600 text-xs mt-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Estoque baixo
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {categories
                          ?.find(
                            (category) => category.id === product.categoryId
                          )
                          ?.name.toUpperCase()}
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
                      <TableCell>
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
                            companyId={companyId}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
