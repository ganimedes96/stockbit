"use client";
import { StatusServer } from "@/api/types";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { Button } from "@/components/ui/button";
import {  useUpdatedMoviment } from "@/domain/movements/queries";
import { Movements, StockMovementType } from "@/domain/movements/types";
import { useProductList } from "@/domain/product/queries";
import { User } from "@/domain/user/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formMovimentSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().min(1, "Quantidade é obrigatório"),
  type: z.enum([StockMovementType.STOCK_IN, StockMovementType.STOCK_OUT]),
  reason: z.string().min(1, "Motivo é obrigatório"),
  description: z.string().optional(),
});

type FormMoviment = z.infer<typeof formMovimentSchema>;

interface FormMovimentProps {
  movement: Movements  
  user: User;
  onSuccess: () => void;
}

export function FormUpdate({ onSuccess, user, movement }: FormMovimentProps) {
  const { mutateAsync } = useUpdatedMoviment(user.company.id);
  const { data: products, isLoading } = useProductList(user.company.id);

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormMoviment>({
    resolver: zodResolver(formMovimentSchema),
    defaultValues: {
      type: movement.type,
      productId: movement.productId,
      quantity: movement.quantity,
      reason: movement.reason,
      description: movement.description,
    },
  });

  const onSubmit = async (data: FormMoviment) => {
    try {
      await mutateAsync(
        {
          ...data,
          id: movement.id,
          responsible: user.role === "admin" ? "admin" : user.firstName,
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

  const type = watch("type");

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ControlledCombobox
          control={control}
          loading={isLoading}
          placeholder="Selecione um produto"
          options={
            products?.map((product) => ({
              id: product.id,
              name: product.name,
            })) || []
          }
          name="productId"
          label="Produto *"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ControlledInput
            control={control}
            placeholder="0"
            name="quantity"
            label="Quantidade *"
            type="number"
          />
          <ControlledSelect
            placeholder="Selecione um tipo"
            control={control}
            options={[
              { id: StockMovementType.STOCK_IN, name: "Entrada" },
              { id: StockMovementType.STOCK_OUT, name: "Saida" },
            ]}
            name="type"
            label="Tipo *"
          />
        </div>
        <ControlledSelect
          disabled={!type}
          placeholder="Selecione um motivo"
          control={control}
          options={
            type === StockMovementType.STOCK_IN
              ? [
                  { id: "Compra", name: "Compra" },
                  { id: "Devolução", name: "Devolução" },
                  { id: "Ajuste de inventário", name: "Ajuste de inventário" },
                ]
              : [
                  { id: "Venda", name: "Venda" },
                  { id: "Perda/Dano", name: "Perda/Dano" },
                  { id: "Ajuste de inventário", name: "Ajuste de inventário" },
                  { id: "Transferência", name: "Transferência" },
                ]
          }
          name="reason"
          label="Motivo *"
        />
        <ControlledTextarea
          control={control}
          placeholder="Informe uma descrição (opcional)"
          name="description"
          label="Descrição"
          limit={100}
        />
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Savando..." : "Registrar movimentação"}
        </Button>
      </form>
    </>
  );
}
