"use client";
import { Skeleton } from "@/components/ui/skeleton";
export function CardProductSkeleton() {
  return (
    <div className="rounded-lg border shadow-sm min-w-80">
      <Skeleton className="aspect-square w-full rounded-t-lg" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" /> {/* Categoria */}
        <Skeleton className="h-5 w-2/3" /> {/* Nome */}
        <Skeleton className="h-4 w-full" /> {/* Descrição */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" /> {/* Preço */}
          <Skeleton className="h-8 w-24" /> {/* Botão */}
        </div>
      </div>
    </div>
  );
}
