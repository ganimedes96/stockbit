"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ControlledInput } from "@/components/form/controllers/controlled-input"; // Reutilizando seu componente
import { Loader2, RotateCcw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "next/link";
import { useGetLatestCashSessionOnClient } from "@/domain/cash-closing/queries";
import { User } from "@/domain/user/types";
import { CashSessionStatus } from "@/domain/cash-closing/types";

// 1. Schema de validação com Zod
const formSchema = z.object({
  initialAmount: z.coerce // 'coerce' converte o input de texto para número
    .number()
    .min(0, "O valor não pode ser negativo."),
});

type FormValues = z.infer<typeof formSchema>;

// 2. Props que o modal recebe
interface OpenCashDrawerModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onConfirm: (initialAmount: number) => void;
  isSubmitting?: boolean;
}

export function OpenCashDrawerModal({
  isOpen,
  user,
  onClose,
  onConfirm,
  isSubmitting = false,
}: OpenCashDrawerModalProps) {
  const { data: dailySession } =
    useGetLatestCashSessionOnClient(user.company.id);

  // 3. Configuração do formulário com React Hook Form e Zod
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialAmount: 0,
    },
  });

  const { control, handleSubmit, reset } = methods;

  // Reseta o formulário sempre que o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // 4. Função de submissão que chama o callback 'onConfirm'
  const onSubmit = (data: FormValues) => {
    onConfirm(data.initialAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {dailySession && dailySession.status === CashSessionStatus.FINALIZED ? (
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
            <DialogTitle className="text-2xl">Reabrir Caixa</DialogTitle>
            <DialogDescription>
              Este caixa ja foi fechado hoje, por favor volte para o menu de caixa.
            </DialogDescription>
          </DialogHeader>
          
          <Button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <Link href="/pdv/close-caixa">Reabrir Caixa</Link>
          </Button>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Abrir Caixa</DialogTitle>
            <DialogDescription>
              Informe o valor inicial (suprimento) na gaveta para começar as
              vendas do dia.
            </DialogDescription>
          </DialogHeader>

          {/* Usamos o FormProvider para que os componentes controlados funcionem */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <ControlledInput
                control={control}
                name="initialAmount"
                label="Valor Inicial em Dinheiro"
                type="number"
                placeholder="Ex: 100.00"
                step="0.01" // Permite centavos
                autoFocus
              />

              <DialogFooter>
                <Button type="button" variant="outline" className="w-full">
                  <Link href="/pdv/close-caixa">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Abrir Caixa e Iniciar Vendas
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      )}
    </Dialog>
  );
}
