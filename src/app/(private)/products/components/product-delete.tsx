"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteProduct } from "@/domain/product/queries";
import { Product } from "@/domain/product/types";

import { Trash } from "lucide-react";
import { useState } from "react";

interface ClientDeleteProps {
  product: Product;
  buttonText?: string;
  companyId: string;
  description?: string;
}

export function ProductDelete({
  product,
  description,
  companyId,
  buttonText,
}: ClientDeleteProps) {
    const { mutateAsync, isPending } = useDeleteProduct(companyId, product.id);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await mutateAsync();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          
          variant="outline"
          size="icon"
          className=" w-9 h-9 "
          title="Excluir"
        >
          <Trash className="text-destructive" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className=" flex flex-col gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            loading={isPending}
            titleLoading="Excluindo..."
          >
            Confirmar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
