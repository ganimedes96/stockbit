"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateClient } from "@/domain/clients/queries";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Client } from "@/domain/clients/types";
import { StatusServer } from "@/api/types";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z
    .string()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Email inválido",
    }),
  phone: z.string().min(11, "Telefone inválido").max(11, "Telefone inválido"),
  birthday: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientUpdateProps {
  companyId: string;
  onSuccess: () => void;
  client: Client;
}

export function ClientUpdate({
  companyId,
  onSuccess,
  client,
}: ClientUpdateProps) {
  const defaultValues = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    birthday: client.birthday
      ? format(new Date(client.birthday), "dd/MM/yyyy")
      : "",
  };

  const { mutateAsync, isPending } = useUpdateClient(companyId, client.id);
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    await mutateAsync(data, {
      onSuccess: (response) => {
        if (response.status === StatusServer.success) {
          reset();
          onSuccess?.();
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ControlledInput
        control={control}
        name="name"
        placeholder="Digite o nome."
        label="Nome *"
        maxLength={60}
      />
      <ControlledInput
        control={control}
        name="email"
        placeholder="Digite o email."
        label="Email"
        maxLength={80}
      />
      <ControlledInput
        control={control}
        name="birthday"
        label="Data de nascimento"
        maskType="date"
        placeholder="DD/MM/AAAA"
      />
      <ControlledInput
        control={control}
        name="phone"
        label="Telefone Whatsapp *"
        maskType="phoneMobile"
        placeholder="(99) 99999-9999"
      />

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !isDirty}
        loading={isPending}
        titleLoading="Atualizando..."
      >
        Atualizar
      </Button>
    </form>
  );
}
