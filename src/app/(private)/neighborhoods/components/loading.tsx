"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
  /**
   * O número de colunas que a sua tabela real possui.
   */
  columns: number;
  /**
   * O número de linhas de skeleton a serem exibidas. O padrão é 5.
   */
  rows?: number;
}

/**
 * Componente reutilizável para exibir um 'esqueleto' de carregamento para tabelas.
 * Ele renderiza um número configurável de linhas e colunas com o componente Skeleton do Shadcn/ui.
 */
export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  // Cria um array com o número de linhas desejado para o loop
  const skeletonRows = Array.from({ length: rows });

  return (
    // Usamos um React Fragment (<>) para agrupar as linhas sem adicionar um <div> extra,
    // o que evita os erros de hidratação que discutimos.
    <>
      {skeletonRows.map((_, index) => (
        <TableRow key={`skeleton-row-${index}`}>
          {/* Cria uma TableCell com um Skeleton para cada coluna */}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${colIndex}`}>
              <Skeleton className="h-6 w-full rounded-md" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}