"use client";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/domain/user/types";
import { ControlledImage } from "@/components/form/controllers/controlled-image";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { useCreateProduct } from "@/domain/product/queries";
import { formProductSchema, FormProductValues } from "../components/schema";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { FormCategory } from "@/app/(private)/category/components/form-category";
import { useCategoryList } from "@/domain/category/queries";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { useSupplierList } from "@/domain/supplier/queries";
import { FormSupplier } from "@/app/(private)/(supplier)/components/form-supplier";

interface ProductFormProps {
  user: User;
}
export default function FormProduct({ user }: ProductFormProps) {
  const { data: categories, isFetching } = useCategoryList(user.company.id);
  const { data: suppliers } = useSupplierList(user.company.id);
  const { mutateAsync } = useCreateProduct(user.company.id);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<FormProductValues>({
    resolver: zodResolver(formProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      supplierId: "",
      purchasePrice: 1,
      openingStock: 1,
      minimumStock: 1,
      isActive: false,
      salePrice: 1,
      photo: undefined,
    },
  });

  const onSubmit = async (data: FormProductValues) => {
    try {
      
      const body = {
        name: data.name,
        description: data.description ?? "",
        supplierId: data.supplierId,
        sku: data.sku ?? "",
        purchasePrice: data.purchasePrice,
        openingStock: data.openingStock,
        minimumStock: data.minimumStock,
        categoryId: data.categoryId,
        isActive: data.isActive,
        salePrice: data.salePrice,
        photo:typeof data.photo === "string" ? "" : data.photo,
      };

      await mutateAsync(body, {
        onSuccess: () => {
          reset({
            name: "",
            description: "",
            supplierId: "",
            purchasePrice: 1,
            openingStock: 1,
            minimumStock: 1,
            isActive: false,
            salePrice: 1,
            photo: "",
            categoryId: "",
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="mx-auto   flex flex-col items-center justify-between w-full">
        <form action="" className="w-full " onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">

          <ControlledImage
            control={control}
            name="photo"
            label=""
            rules={{ required: false }}
            size={150}
          />
          <div className="w-full grid grid-cols-1 md:grid-cols-[2fr_0.7fr] gap-4">
            <ControlledInput
              className="w-full"
              control={control}
              name="name"
              label="Nome do produto *"
              placeholder="Ex: Smartphone"
              rules={{ required: "Nome é obrigatório" }}
            />
            <ControlledInput
              className="w-full"
              control={control}
              name="sku"
              label="SKU"
              placeholder="Ex: PE-001"
            />
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-[2fr_2fr] gap-4">
            <ControlledCombobox
              control={control}
              name="categoryId"
              label="Selecione uma categoria *"
              loading={isFetching}
              options={categories?.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              placeholder="Selecione um cliente"
              rightComponent={
                <FormSheet
                  title="Nova categoria"
                  description="Preencha os campos abaixo para criar uma nova categoria."
                  formComponent={FormCategory}
                  formProps={{
                    companyId: user.company.id,
                  }}
                  side="left"
                  customButton={
                    <Button variant="link" size="sm" className="h-5">
                      Adicionar
                    </Button>
                  }
                />
              }
            />
            <ControlledCombobox
              control={control}
              name="supplierId"
              label="Selecione um fornecedor"
              loading={isFetching}
              options={suppliers?.map((supplier) => ({
                id: supplier.id,
                name: supplier.name,
              }))}
              placeholder="Selecione um fornecedor"
              rightComponent={
                <FormSheet
                  title="Novo fornecedor"
                  description="Preencha os campos abaixo para criar um novo fornecedor."
                  formComponent={FormSupplier}
                  formProps={{
                    companyId: user.company.id,
                  }}
                  side="right"
                  customButton={
                    <Button variant="link" size="sm" className="h-5">
                      Adicionar
                    </Button>
                  }
                />
              }
            />
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-[3fr_3fr] gap-4">
            <ControlledInput
              control={control}
              name="salePrice"
              className="w-full"
              label="Preço de venda*"
              type="number"
              placeholder="Ex: 29.90"
              rules={{ required: "Preço é obrigatório" }}
            />
            <ControlledInput
              control={control}
              name="purchasePrice"
              className="w-full"
              label="Preço de compra*"
              type="number"
              placeholder="Ex: 29.90"
              rules={{ required: "Preço de compra é obrigatório" }}
            />

            <ControlledInput
              control={control}
              name="openingStock"
              className="w-full"
              label="Estoque inicial*"
              type="number"
              placeholder="Ex: 30"
              rules={{ required: "Estoque inicial é obrigatório" }}
            />
            <ControlledInput
              control={control}
              name="minimumStock"
              className="w-full"
              label="Estoque mínimo*"
              type="number"
              placeholder="Ex: 30"
              rules={{ required: "Estoque mínimo é obrigatório" }}
            />
          </div>
          <ControlledTextarea
            control={control}
            name="description"
            label="Descrição"
            placeholder="Descrição do produto"
            limit={100}
          />

          <Button
            className={`disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={isSubmitting}
            type="submit"
            size="lg"
          >
           {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
          </div>
        </form>
      </div>
    </>
  );
}
