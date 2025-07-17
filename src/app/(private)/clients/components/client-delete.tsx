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
import { useDeleteClient } from "@/domain/clients/queries";
import type { Client } from "@/domain/clients/types";
import { Trash } from "lucide-react";
import { useState } from "react";

interface ClientDeleteProps {
  client: Client;
  buttonText?: string;
  companyId: string;
}

export function ClientDelete({ client, companyId, buttonText }: ClientDeleteProps) {
  const { mutateAsync, isPending } = useDeleteClient(companyId, client.id);
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
          className=" w-8 h-8 "
          title="Excluir"
        >
          <Trash className="h-4 w-4 text-destructive" />
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
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
