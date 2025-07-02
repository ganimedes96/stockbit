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
    <Card className="flex flex-row w-full max-w-none  overflow-hidden"> {/* Ajuste nas margens */}
      {/* Imagem responsiva - agora com proporção quadrada */}
      <div className="w-36 h-44 sm:w-32 sm:h-32 md:w-52 md:h-52 flex-shrink-0 relative">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
           sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
        />
          {isNew && (
            <Badge className="absolute top-2 left-2 bg-emerald-400 text-white">
                Novo
            </Badge>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0 p-2 sm:p-4"> {/* Padding reduzido em mobile */}
        <div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 truncate" title={name}>
            {name}
          </h3>
          <div className="mb-1 sm:mb-2">
            <Badge variant="secondary" className="text-xs">
              {categoryName || "Sem Categoria"}
            </Badge>
          </div>
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3" title={description}>
              {description}
            </p>
          )}
        </div>

        <div className="mt-2 sm:mt-0 flex flex-col items-start justify-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl font-bold text-green-600">
            {formatCurrency(salePrice)}
          </span>
          <span className={`text-xs sm:text-sm ${
            product.openingStock > 0 ? "text-green-600" : "text-red-600"
          }`}>
            {product.openingStock > 0 ? `Em estoque` : `Fora de estoque`}
          </span>
          <Button
            disabled={product.openingStock === 0}
            className="w-full text-xs sm:text-sm h-8 sm:h-9 disabled:bg-gray-300/20 disabled:text-gray-500 disabled:cursor-not-allowed"
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