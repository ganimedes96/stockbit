"use client";

import { useProductList } from "@/domain/product/queries";
import { useCategoryList } from "@/domain/category/queries"; // 1. Importa o hook de categorias
import { Product } from "@/domain/product/types";
import { User } from "@/domain/user/types";
import { useMemo, useState } from "react";
// import { List } from "./card-product/list";
import { CardProductSkeleton } from "./card-product-skeleton";
import { useCart } from "@/providers/cart-context";
import { List } from "./card-product/list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3X3, List as ListIcon, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Grid } from "./card-product/grid";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface CatalogListProps {
  user: User;
}

export function CatalogList({ user }: CatalogListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("news"); //
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: products, isLoading: isLoadingProducts } = useProductList(
    user.company.id
  );
  const { data: categories, isLoading: isLoadingCategories } = useCategoryList(
    user.company.id
  );
  const { addToCart } = useCart();
  const isLoading = isLoadingProducts || isLoadingCategories;

  const categoryMap = useMemo(() => {
    if (!categories) return new Map<string, string>();

    return categories.reduce((map, category) => {
      map.set(category.id, category.name);
      return map;
    }, new Map<string, string>());
  }, [categories]);

  const processedProducts = useMemo(() => {
    const activeProducts =
      products?.filter((product) => product.isActive) || [];

    if (!activeProducts) return [];

    let processed = [...activeProducts];

    if (selectedCategory !== "all") {
      processed = processed.filter(
        (product) => product.categoryId === selectedCategory
      );
    }
    // Filtro de busca por texto
    if (debouncedSearchTerm) {
      processed = processed.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Lógica de ordenação
    switch (sortBy) {
      case "price-low":
        processed.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price-high":
        processed.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "name":
        processed.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "news":
      default:
        processed.sort(
          (a, b) =>
            (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
        );
        break;
    }

    return processed;
  }, [products, debouncedSearchTerm, sortBy, selectedCategory]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  const activeProducts =
    products?.filter((product: Product) => product.isActive) || [];

  if (activeProducts.length === 0) {
    return (
      <p className="text-center col-span-full py-12 text-muted-foreground">
        Nenhum produto ativo encontrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-screen max-w-[1200px] mx-auto">
      <Card className="w-full flex flex-col sm:flex-row items-center justify-between md:p-4 p-2 gap-6">
        <div className="w-full sm:flex-1 flex items-center gap-4">
          <Input
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
            iconPosition="left"
            className="w-full sm:w-96"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="sm:hidden">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 justify-between w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias </SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="truncate block max-w-[100px]">
                    {category.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="news">Novidades</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="price-low">Menor preço</SelectItem>
              <SelectItem value="price-high">Maior preço</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden sm:block">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* View Mode */}
      </Card>
      {processedProducts.length === 0 && (
        <p className="text-center col-span-full py-12 text-muted-foreground">
          Nenhum produto encontrado com os filtros aplicados.
        </p>
      )}
      {viewMode === "list" ? (
        <div className="flex flex-col w-full  gap-2 sm:gap-4  sm:px-0">
          {processedProducts.map((product) => (
            <List
              key={product.id}
              product={product}
              categoryName={
                categoryMap.get(product.categoryId) || "Sem Categoria"
              }
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
          {processedProducts.map((product) => (
            <Grid
              key={product.id}
              product={product}
              categoryName={
                categoryMap.get(product.categoryId) || "Sem Categoria"
              }
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
