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

// A interface agora espera o nome da categoria e uma função para adicionar ao carrinho
interface CardProductProps {
  product: Product;
  categoryName: string;
  onAddToCart: (product: Product) => void;
}

export function Grid({
  product,
  categoryName,
  onAddToCart,
}: CardProductProps) {
  const { name, description, photo, salePrice } = product;
  const imageSrc =
    typeof photo === "string" && photo !== "" ? photo : ImmageDefault;




  const isNew = product.createdAt ? isProductNew(product.createdAt) : false;

  return (
    <Card className="min-w-80 flex flex-col justify-between ">
      <div>
        <div className="aspect-square relative">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
           {isNew && (
            <Badge className="absolute top-2 left-2 bg-emerald-400 text-white">
                Novo
            </Badge>
        )}
           
        </div>
        <div className="p-4">
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs">
              {/* Usa a prop diretamente, com um fallback */}
              {categoryName || "Sem Categoria"}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-1 truncate" title={name}>
            {name}
          </h3>
          {product.description && (
            <p
              className="text-gray-600 text-sm mb-3 h-10 line-clamp-2"
              title={description}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col items-start justify-center gap-2">
        <span className="text-xl font-bold text-green-600">
          {formatCurrency(salePrice)}
        </span>
        <span
          className={`text-sm ${
            product.openingStock > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.openingStock > 0 ? `Em estoque` : `Fora de estoque`}
        </span>
        <Button
          disabled={product.openingStock === 0}
          className="w-full disabled:bg-gray-300/20 disabled:text-gray-500 disabled:cursor-not-allowed"
          onClick={() => onAddToCart(product)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </Card>
  );
}
