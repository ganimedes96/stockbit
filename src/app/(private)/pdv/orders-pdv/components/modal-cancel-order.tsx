import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ModalCancelOrderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleCancelOrder: () => void;
  isPending: boolean;
}

export function ModalCancelOrder({
  open,
  setOpen,
  handleCancelOrder,
  isPending,
}: ModalCancelOrderProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar estorno?</AlertDialogTitle>
          <AlertDialogDescription>
            {`
                Este estorno irá cancelar a venda e retornar os itens ao estoque.
              `}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancelOrder} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelando...
              </>
            ) : (
              "Sim, cancelar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
