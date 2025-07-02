"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { StatusServer } from "@/api/types";
import { useCreateNeighborhood } from "@/domain/neighborhoods/queries";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  deliveryFee: z.number().min(1, "Taxa de entrega é obrigatório"),
  minOrderValueForFreeShipping: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  companyId: string;
  onSuccess: () => void;
}

export function RegisterNeighborhood({
  companyId,
  onSuccess,
}: ClientFormProps) {
  const { mutateAsync, isPending } = useCreateNeighborhood(companyId);
  const { control, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      deliveryFee: 0,
      minOrderValueForFreeShipping: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(
        {
          isActive: true,
          ...values,
        },
        {
          onSuccess: (data) => {
            if (data.status === StatusServer.success) {
              onSuccess();
              reset();
            }
          },
        }
      );
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ControlledInput
        control={control}
        name="name"
        placeholder="Digite o nome."
        label="Nome do bairro *"
        maxLength={60}
      />
      <div className="grid grid-cols-2 gap-4">
        <ControlledInput
          control={control}
          type="number"
          name="deliveryFee"
          placeholder="Digite a taxa de entrega."
          label="Taxa de entrega *"
        />

        <ControlledInput
          control={control}
          type="number"
          name="minOrderValueForFreeShipping"
          label="Valor minimo para entrega gratis"
          placeholder="Digite o valor minimo para entrega gratis."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Cadastrando..." : "Cadastrar bairro"}
      </Button>
    </form>
  );
}
