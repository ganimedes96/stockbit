"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateClient } from "@/domain/clients/queries";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { StatusServer } from "@/api/types";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z
    .string()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Email inválido",
    }),
  phone: z.string().min(11, "Telefone inválido"),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  companyId: string;
  onSuccess: () => void;
}

export function ClientForm({ companyId, onSuccess }: ClientFormProps) {
  const { mutateAsync, isPending } = useCreateClient(companyId);
  const { control, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values, {
        onSuccess: (data) => {
          if (data.status === StatusServer.success) {
            onSuccess();
            reset();
          }
        },
      });
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
        label="Nome*"
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
        name="phone"
        label="Telefone Whatsapp*"
        maskType="phoneMobile"
        placeholder="(99) 99999-9999"
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Criando..." : "Criar Cliente"}
      </Button>
    </form>
  );
}
