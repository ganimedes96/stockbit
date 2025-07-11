"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Product } from "@/domain/product/types";
import Image from "next/image";
import ImmageDefault from "@/assets/default.png";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/text/format";
import { isProductNew } from "../helpers";

interface CardProductProps {
  product: Product;
  categoryName: string;
  onAddToCart: (product: Product) => void;
}

export function List({ product, categoryName, onAddToCart }: CardProductProps) {
  const { name, description, photo, salePrice } = product;

  const imageSrc =
    typeof photo === "string" && photo !== "" ? photo : ImmageDefault;
  const isNew = product.createdAt ? isProductNew(product.createdAt) : false;

  return (
    <Card className="flex flex-row w-full max-w-none overflow-hidden">
      {/* Imagem responsiva */}
      <div className="w-28 h-36 xs:w-32 xs:h-40 sm:w-32 sm:h-32 md:w-52 md:h-52 flex-shrink-0 relative">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
        />
        {isNew && (
          <Badge className="absolute top-2 left-2 bg-emerald-400 text-white text-[10px] sm:text-xs">
            Novo
          </Badge>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0 p-2 sm:p-4">
        <div>
          <h3
            className="font-semibold text-sm xs:text-base sm:text-lg mb-1 truncate"
            title={name}
          >
            {name}
          </h3>

          <div className="mb-1 sm:mb-2">
            <Badge variant="secondary" className="text-[10px] xs:text-xs">
              {categoryName || "Sem Categoria"}
            </Badge>
          </div>

          {description && (
            <p
              className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3"
              title={description}
            >
              {description}
            </p>
          )}
        </div>

        <div className="mt-2 sm:mt-0 flex flex-col items-start justify-center gap-1 xs:gap-2 sm:gap-3">
          <span className="text-base xs:text-lg sm:text-xl font-bold text-green-600">
            {formatCurrency(salePrice)}
          </span>

          <span
            className={`text-[11px] xs:text-xs sm:text-sm ${
              product.openingStock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.openingStock > 0 ? `Em estoque` : `Fora de estoque`}
          </span>

          <Button
            type="button"
            disabled={product.openingStock === 0}
            className="w-full text-[11px] xs:text-xs sm:text-sm h-7 xs:h-8 sm:h-9 disabled:bg-gray-300/20 disabled:text-gray-500 disabled:cursor-not-allowed"
            onClick={() => onAddToCart(product)}
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </Card>
  );
}
