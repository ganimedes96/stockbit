"use client";
import { Neighborhood } from "@/domain/neighborhoods/types";
import z from "zod";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { StatusServer } from "@/api/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateNeighborhood } from "@/domain/neighborhoods/queries";
import { User } from "@/domain/user/types";

interface UpdateNeighborhoodProps {
  user: User;
  neighborhood: Neighborhood;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  deliveryFee: z.number().min(1, "Taxa de entrega é obrigatório"),
  minOrderValueForFreeShipping: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function UpdateNeighborhood({
  user,
  neighborhood,
}: UpdateNeighborhoodProps) {
  const { mutateAsync, isPending } = useUpdateNeighborhood(user.company.id);

  const { control, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: neighborhood?.name,
      deliveryFee: neighborhood?.deliveryFee,
      minOrderValueForFreeShipping: neighborhood?.minOrderValueForFreeShipping,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(
        {
          id: neighborhood.id,
          isActive: true,
          ...values,
        },
        {
          onSuccess: (data) => {
            if (data.status === StatusServer.success) {
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
      <div className="grid md:grid-cols-2 gap-4">
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
        {isPending ? "Atualizando..." : "Atualizar bairro"}
      </Button>
    </form>
  );
}
