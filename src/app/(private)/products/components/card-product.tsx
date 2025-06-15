"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/domain/product/types";
import Image from "next/image";
import ImageProduct from "@/assets/default.png";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/text/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, SquarePen } from "lucide-react";
import { ProductDelete } from "./product-delete";
import Link from "next/link";
import { ProductActiveSwitch } from "./product-active-switch";

interface CardProductProps {
  product: Product;
  companyId: string;
}

export function CardProduct({ product, companyId }: CardProductProps) {
  return (
    <Card className="w-full flex flex-col">
      <div className="relative">
        <Image
          className="w-full object-cover"
          src={product.photo || ImageProduct}
          alt={product.name}
          width={300}
          height={100}
        />
        <div className="w-full absolute top-0 left-0 p-2">
          <div className="w-full flex gap-2 items-center justify-between">
            <Badge

              className={`${
                product.isActive ? "bg-green-500" : "bg-destructive"
              } text-primary hover:outline-none`}
              variant={"outline"}
            >
              {product.isActive ? "Ativo" : "Inativo"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full text-primary"
                >
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
               

                <DropdownMenuItem asChild>
                  <Button variant="ghost" icon={<SquarePen />}>
                    <Link href={`/products/update/${product.id}`}>Editar</Link>
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <ProductDelete
                    buttonText="Excluir"
                    product={product}
                    companyId={companyId}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <CardHeader className="p-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{product.name}</CardTitle>
        
      </CardHeader>
      <CardContent className="p-2 flex flex-col items-start justify-between gap-4">
        <CardDescription className="">
          {product.description || "Sem descrição"}
        </CardDescription>
        <span className="text-emerald-500">
          {formatCurrency(product.salePrice)}
        </span>
      </CardContent>
      <CardFooter className="p-2 flex flex-row items-center justify-between">
        <p className="text-muted-foreground">{`Produto ${
          product.isActive ? "Ativo" : "Inativo"
        }`}</p>
        <ProductActiveSwitch product={product} companyId={companyId} />
      </CardFooter>
     
    </Card>
  );
}
