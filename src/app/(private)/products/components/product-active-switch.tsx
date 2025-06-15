"use client";

import { Switch } from "@/components/ui/switch";
import { useUpdateStatusProduct } from "@/domain/product/queries";
import { Product } from "@/domain/product/types";


interface EmployeeActiveSwitchProps {
  companyId: string;
  product: Product;
}

export function ProductActiveSwitch({
  companyId,
 product,

}: EmployeeActiveSwitchProps) {
  const { mutate, isPending } = useUpdateStatusProduct(
    companyId,
    product.id,
  
  );

  const handleStatusChange = () => {
    mutate(!product.isActive);
  };

  return (
    <Switch
      checked={product.isActive}
      onCheckedChange={handleStatusChange}
      disabled={isPending}
      aria-label="Toggle service status"
    />
  );
}
