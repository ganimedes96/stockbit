import { StatusServer } from "@/api/types";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { Button } from "@/components/ui/button";
import { useCreateCategory } from "@/domain/category/queries";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import z from "zod";

interface CategoryFormProps {
  companyId: string;
  onSuccess: () => void;
}

const formCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

export type FormCategorySchema = z.infer<typeof formCategorySchema>;

export function FormCategory({ companyId, onSuccess }: CategoryFormProps) {
  const { mutateAsync, isPending } = useCreateCategory(companyId);
  const { control, reset, handleSubmit } = useForm<FormCategorySchema>({
    resolver: zodResolver(formCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormCategorySchema) => {
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
        <ControlledTextarea
          control={control}
          name="description"
          placeholder="Digite a descrição."
          label="Descrição"
          limit={100}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Criando..." : "Criar Categoria"}
        </Button>
      </form>
    </>
  );
}
