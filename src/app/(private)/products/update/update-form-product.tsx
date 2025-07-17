"use client";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/domain/user/types";
import { ControlledImage } from "@/components/form/controllers/controlled-image";
import { useUpdateProduct } from "@/domain/product/queries";
import { formProductSchema, FormProductValues } from "../components/schema";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { useCategoryList } from "@/domain/category/queries";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { FormCategory } from "@/app/(private)/category/components/form-category";
import { FormSupplier } from "@/app/(private)/supplier/components/form-supplier";
import { useSupplierList } from "@/domain/supplier/queries";
import { useEffect, useMemo } from "react";
import { Product } from "@/domain/product/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { Dices } from "lucide-react";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
import { ControlledDateTimePicker } from "@/components/form/controllers/controlled-date-time-picker";

interface ProductFormProps {
  user: User;
  product: Product;
  onSuccess: () => void;
}

export default function UpdateFormProduct({
  user,
  product,
  onSuccess,
}: ProductFormProps) {
  const { data: suppliers } = useSupplierList(user.company.id);
  const { data: categories, isFetching } = useCategoryList(user.company.id);

  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct(user.company.id);

  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }, [categories]);

  const supplierOptions = useMemo(() => {
    if (!suppliers) return [];
    return suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
    }));
  }, [suppliers]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormProductValues>({
    resolver: zodResolver(formProductSchema),
    defaultValues: {
      name: product?.name,
      description: product?.description,
      minimumStock: product?.minimumStock,
      openingStock: product?.openingStock,
      purchasePrice: product?.purchasePrice,
      hasAnExpirationDate: product?.hasAnExpirationDate,
      expirationDate: product?.expirationDate,
      supplierId: product?.supplierId,
      categoryId: product?.categoryId,
      isActive: product?.isActive,
      salePrice: product?.salePrice,
      photo: product?.photo || undefined,
    },
  });
  const productName = watch("name");
  const hasAnExpirationDate = watch("hasAnExpirationDate");
  const handleGenerateSku = () => {
    const prefix = productName.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const sku = `${prefix}-${randomNum}`;
    setValue("sku", sku, { shouldValidate: true });
  };

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        isActive: product.isActive,
        categoryId: product.categoryId,
        salePrice: product.salePrice,
        hasAnExpirationDate: product.hasAnExpirationDate,
        expirationDate: product.expirationDate,
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
      const body = {
        id: product.id,
        name: data.name,
        sku: data.sku ?? "",
        categoryId: data.categoryId,
        hasAnExpirationDate: data.hasAnExpirationDate,
        expirationDate: hasAnExpirationDate ? data.expirationDate : undefined,
        description: data.description ?? "",
        minimumStock: data.minimumStock,
        openingStock: data.openingStock,
        purchasePrice: data.purchasePrice,
        supplierId: data.supplierId,
        isActive: data.isActive,
        salePrice: data.salePrice,
        photo:
          data.photo === null
            ? undefined
            : typeof data.photo === "string"
            ? data.photo
            : data.photo,
      };

      await updateProduct(body, {
        onSuccess: () => {
          reset();
          onSuccess();
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao atualizar produto");
    }
  };

  return (
    <div className="mx-auto flex flex-col h-[calc(100vh-150px)]">
      <ScrollArea className="h-full w-full pr-4">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pb-4">
          <div className="flex flex-col gap-4">
            <ControlledImage
              control={control}
              name="photo"
              imageUrl={
                typeof product?.photo === "string" ? product.photo : undefined
              }
              label="Foto do produto (Opcional)"
              rules={{ required: false }}
              size={150}
            />

            <div className="w-full grid grid-cols-[2fr_0.8fr] gap-4">
              <ControlledInput
                className="w-full"
                control={control}
                name="name"
                label="Nome do produto *"
                placeholder="Ex: Smartphone"
                rules={{ required: "Nome é obrigatório" }}
              />
              <div className="w-full flex flex-row gap-2 items-center justify-center">
                <ControlledInput
                  className="w-full"
                  control={control}
                  name="sku"
                  label="SKU"
                  placeholder="Ex: PER-001"
                />
                <Button
                  disabled={!productName}
                  type="button"
                  variant="outline"
                  className=" h-10 w-10 mt-6 disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleGenerateSku}
                >
                  <Dices />
                </Button>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-[2fr_2fr] gap-4">
              <ControlledCombobox
                control={control}
                name="categoryId"
                label="Selecione uma categoria *"
                loading={isFetching}
                options={categoryOptions}
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
                options={supplierOptions}
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

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="w-full flex flex-col gap-4">
              <ControlledSwitch
                control={control}
                name="hasAnExpirationDate"
                label="Tem data de validade?"
              />
              {hasAnExpirationDate && (
                <ControlledDateTimePicker
                  control={control}
                  name="expirationDate"
                  showTime={false}
                  label="Data *"
                  placeholder="Selecione uma data"
                />
              )}
            </div>

            <ControlledTextarea
              control={control}
              name="description"
              label="Descrição"
              placeholder="Descrição do produto"
              limit={100}
            />
          </div>

          {isDirty && (
            <div className="sticky bottom-0 bg-background py-4 mt-4 border-t">
              <Button
                className="w-full"
                disabled={isUpdating}
                type="submit"
                size="lg"
              >
                {isUpdating ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </form>
      </ScrollArea>
    </div>
  );
}
