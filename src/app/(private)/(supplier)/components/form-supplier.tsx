import { StatusServer } from "@/api/types";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { Button } from "@/components/ui/button";
import { useCreateSupplier } from "@/domain/supplier/queries";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import z from "zod";

interface SupplierFormProps {
  companyId: string;
  onSuccess: () => void;
}

const formSupplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf_cnpj: z.string().min(1, "CEP ou CNPJ é obrigatório"),
  email: z.string().email("Formato de e-mail inválido").optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type FormSupplierSchema = z.infer<typeof formSupplierSchema>;

export function FormSupplier({ companyId, onSuccess }: SupplierFormProps) {
  const { mutateAsync, isPending } = useCreateSupplier(companyId);
  const { control, reset, handleSubmit } = useForm<FormSupplierSchema>({
    resolver: zodResolver(formSupplierSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormSupplierSchema) => {
    try {
      await mutateAsync(data, {
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
    <>
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
          maxLength={60}
        />
        <ControlledInput
          control={control}
          name="phone"
          maskType="phoneMobile"
          placeholder="Digite o telefone."
          label="Telefone"
          maxLength={60}
        />

        <ControlledInput
          control={control}
          name="address"
          placeholder="Digite o endereço."
          label="Endereço"
          maxLength={60}
        />

        <ControlledInput
          control={control}
          name="cpf_cnpj"
          maskType="cnpj"
          placeholder="Digite o CNPJ."
          label="CNPJ "
 
        />
        <ControlledTextarea
          control={control}
          name="description"
          placeholder="Digite a descrição."
          label="Descrição"
          limit={100}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Criando..." : "Adicionar fornecedor"}
        </Button>
      </form>
    </>
  );
}
