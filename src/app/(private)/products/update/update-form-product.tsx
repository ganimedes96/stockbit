"use client";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/domain/user/types";
import { ControlledImage } from "@/components/form/controllers/controlled-image";

import { useGetProductById, useUpdateProduct } from "@/domain/product/queries";
import { formProductSchema, FormProductValues } from "../components/schema";
import { useRouter } from "next/navigation";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { useCategoryList } from "@/domain/category/queries";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { FormCategory } from "@/app/(private)/category/components/form-category";
import { FormSupplier } from "@/app/(private)/(supplier)/components/form-supplier";
import { useSupplierList } from "@/domain/supplier/queries";
import { useEffect } from "react";
import { Product } from "@/domain/product/types";

interface ProductFormProps {
  user: User;
  product: Product;
  onSuccess: () => void;
}

export default function UpdateFormProduct({ user, product, onSuccess }: ProductFormProps) {
  const { data: suppliers } = useSupplierList(user.company.id);
  const router = useRouter();
  const { data: categories, isFetching } = useCategoryList(user.company.id);

  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct(user.company.id);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm<FormProductValues>({
    resolver: zodResolver(formProductSchema),
    defaultValues: {
      name: product?.name,
      description: product?.description,
      minimumStock: product?.minimumStock,
      openingStock: product?.openingStock,
      purchasePrice: product?.purchasePrice,
      supplierId: product?.supplierId,
      categoryId: product?.categoryId,
      isActive: product?.isActive,
      salePrice: product?.salePrice,
      photo: product?.photo || undefined,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        isActive: product.isActive,
        categoryId: product.categoryId,
        salePrice: product.salePrice,
        photo: product.photo || undefined,
        minimumStock: product.minimumStock,
        openingStock: product.openingStock,
        purchasePrice: product.purchasePrice,
        supplierId: product.supplierId,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: FormProductValues) => {
    try {
      let photoUrl = "";

      if (typeof data.photo === "string") {
        photoUrl = data.photo;
      } else if (data.photo instanceof File) {
      }

      const body = {
        id: product.id,
        name: data.name,
        sku: data.sku ?? "",
        categoryId: data.categoryId,
        description: data.description ?? "",
        minimumStock: data.minimumStock,
        openingStock: data.openingStock,
        purchasePrice: data.purchasePrice,
        supplierId: data.supplierId,
        isActive: data.isActive,
        salePrice: data.salePrice,
        photo: photoUrl,
      };

      await updateProduct(body, {
        onSuccess: () => {
          reset()
          onSuccess();
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao atualizar produto");
    }
  };

  return (
    <div className="mx-auto  flex flex-col items-center justify-between w-full">
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full space-y-6">
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
              placeholder="Ex: Pizza Margherita"
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
                  title="Novo cliente"
                  description="Preencha os campos abaixo para criar um novo cliente."
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
                  side="left"
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
        </div>
        {isDirty && (
          
            <Button
              className="w-full mt-6"
              disabled={isUpdating}
              type="submit"
            >
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          
        )}
      </form>
    </div>
  );
}
