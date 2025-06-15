"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CardProductSkeleton() {
  return (
    <div className="w-full flex flex-col">
      <Skeleton className="w-full h-[150px] rounded-t-lg" />
      <div className="p-2 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-6 w-1/3 mt-2" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}