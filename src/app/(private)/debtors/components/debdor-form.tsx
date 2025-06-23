"use client";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useClientList } from "@/domain/clients/queries";
import { Button } from "@/components/ui/button";
import { StatusServer } from "@/api/types";
import { DebtorsSchema } from "./schema";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { ClientForm } from "../../clients/components/client-form";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useProductList } from "@/domain/product/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductRow } from "./product-debtor";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
import { ControlledDateTimePicker } from "@/components/form/controllers/controlled-date-time-picker";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { addDays, formatDate, isToday } from "date-fns";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { formatCurrency } from "@/utils/text/format";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DebdorsCreate,
  Payment,
  PaymentMethod,
  StatusDebtor,
} from "@/domain/debtors/types";
import { useCreateDebtor } from "@/domain/debtors/queries";

type FormValues = z.infer<typeof DebtorsSchema>;

interface ClientFormProps {
  companyId: string;
  onSuccess: () => void;
}

type Installment = {
  installment: number;
  price: number;
  dueDate: Date;
};

export function DebdorForm({ companyId, onSuccess }: ClientFormProps) {
  const { data: allProducts, isLoading: loadingProducts } =
    useProductList(companyId);
  const { mutateAsync, isPending } = useCreateDebtor(companyId);
  const { data: clients, isFetching: fetchingClients } =
    useClientList(companyId);
  const methods = useForm<FormValues>({
    resolver: zodResolver(DebtorsSchema),

    defaultValues: {
      clientId: "",
      paymentMethod: "pix",
      cashPayment: {
        dueDate: new Date(),
       
      },
      paymentInInstallments: {
        dueDate: new Date(),
        installments: 2,
        interval: 30,
        
      },
      products: [
        {
          productId: "",
          quantity: 1,
          priceUnit: 0,
        },
      ],

      description: "",
      isCash: true,
      isInstallments: false,
    },
  });
  const { control, watch, handleSubmit, reset, setValue } = methods;
  const isCash = watch("isCash");
  const isInstallments = watch("isInstallments");
  const cashPaymentDetails = watch("cashPayment");
  const installmentDetails = watch("paymentInInstallments");
  const watchedFormProducts = watch("products");

  useEffect(() => {
    if (isCash) {
      setValue("isInstallments", false, { shouldValidate: true });
    }
  }, [isCash, setValue]);

  useEffect(() => {
    if (isInstallments) {
      setValue("isCash", false, { shouldValidate: true });
    }
  }, [isInstallments, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const handleDeleteProduct = (index: number) => {
    remove(index);
  };

  const totalSale = watchedFormProducts.reduce((acc, product) => {
    const price = Number(product.priceUnit) || 0;
    const quantity = Number(product.quantity) || 0;
    return acc + price * quantity;
  }, 0);

  const generateInstallmentPreview = (): Installment[] => {
    const preview: Installment[] = [];

    if (isCash && totalSale > 0 && cashPaymentDetails?.dueDate) {
      preview.push({
        installment: 1,
        price: totalSale,
        dueDate: cashPaymentDetails.dueDate,
      });
    } else if (isInstallments && totalSale > 0 && installmentDetails) {
      const { installments, dueDate, interval } = installmentDetails;
      const numInstallments = Number(installments) || 0;
      const intervalDays = Number(interval) || 30;

      if (numInstallments > 0 && dueDate) {
        const installmentValue = totalSale / numInstallments;
        for (let i = 0; i < numInstallments; i++) {
          const currentDueDate = addDays(dueDate, i * intervalDays);
          preview.push({
            installment: i + 1,
            price: installmentValue,
            dueDate: currentDueDate,
          });
        }
      }
    }

    return preview;
  };

  const installmentPreview = generateInstallmentPreview();

  const onSubmit = async (values: FormValues) => {
    const installmentPreview = generateInstallmentPreview();

    try {
      console.log("values", values.paymentMethod);
      
      const isSameDayCashPayment =
        values.isCash &&
        values.cashPayment?.dueDate &&
        isToday(values.cashPayment.dueDate);

      const body: DebdorsCreate = {
        clientId: values.clientId,
        paymentMethod: values.paymentMethod as PaymentMethod,
        description: values.description || "",
        payment: values.isCash
          ? Payment.cashPayment
          : Payment.PaymentInInstallments,
        totalSale: totalSale,
        statusDebtor: isSameDayCashPayment
          ? StatusDebtor.paid
          : StatusDebtor.pending,
        products: values.products.map((product) => ({
          productId: product.productId,
          quantity: Number(product.quantity),
          priceUnit: Number(product.priceUnit),
          total: Number(product.quantity) * Number(product.priceUnit),
        })),

        installments: installmentPreview.map((installment) => ({
          installment: installment.installment,
          price: installment.price,
          dueDate: installment.dueDate,
          status: isSameDayCashPayment
            ? StatusDebtor.paid
            : StatusDebtor.pending,
        })),

        paymentInInstallments: values.paymentInInstallments || undefined,
        cashPayment: values.cashPayment || undefined,
      };

      await mutateAsync(body, {
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 p-6">
            <ControlledCombobox
              control={control}
              name="clientId"
              label="Cliente *"
              loading={fetchingClients}
              options={clients?.map((client) => ({
                id: client.id,
                name: client.name,
              }))}
              placeholder="Selecione um cliente"
              rightComponent={
                <FormSheet
                  title="Novo cliente"
                  description="Preencha os campos abaixo para criar um novo cliente."
                  formComponent={ClientForm}
                  formProps={{
                    companyId,
                  }}
                  side="left"
                  customButton={
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-5"
                    >
                      Adicionar
                    </Button>
                  }
                />
              }
            />

            <div className="flex flex-row my-6 items-center justify-between ">
              <h2 className="text-xl font-medium mb-2">Produtos</h2>
              <Button
                type="button"
                onClick={() =>
                  append({
                    priceUnit: 0,
                    quantity: 1, // Iniciar com 1
                    productId: "",
                  })
                }
              >
                <Plus size={16} />
                Adicionar produto
              </Button>
            </div>
            {fields.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum produto adicionado. Clique em Adicionar produto para
                começar.
              </p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ProductRow
                    key={field.id}
                    index={index}
                    allProducts={allProducts}
                    loadingProducts={loadingProducts}
                    onRemove={handleDeleteProduct}
                    isOnlyOne={fields.length === 1}
                  />
                ))}
              </div>
            )}

            <div className=" flex flex-col gap-4 ">
              <h3>Forma de Pagamento</h3>
              <div className="flex items-center justify-between space-x-2">
                <ControlledSwitch
                  control={control}
                  name="isCash"
                  label="Pagamento à Vista"
                />
                <ControlledSwitch
                  control={control}
                  name="isInstallments"
                  label="Pagamento em Parcelas"
                />
              </div>
            </div>

            {isCash && (
              <div className="w-full py-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] items-end gap-4 ">
                <ControlledDateTimePicker
                  control={control}
                  name="cashPayment.dueDate"
                  showTime={false}
                  label="Data *"
                  placeholder="Selecione uma data e hora"
                />
                <ControlledSelect
                  className=""
                  control={control}
                  name="paymentMethod"
                  label="Metodo de Pagamento"
                  placeholder="Selecione o metado de pagamento"
                  options={[
                    { id: PaymentMethod.cash, name: "Dinheiro" },
                    { id: PaymentMethod.pix, name: "Pix" },
                    { id: PaymentMethod.creditCard, name: "Cartão" },
                    { id: PaymentMethod.transfer, name: "Transferência" },
                  ]}
                />
              </div>
            )}

            {isInstallments && (
              <div className="py-4 grid grid-cols-1 md:grid-cols-[0.5fr_1fr_1fr_1fr] items-center justify-between gap-4 ">
                <ControlledSelect
                  className=""
                  control={control}
                  name="paymentInInstallments.installments"
                  label="Parcelas *"
                  placeholder="Selecione o número de parcelas"
                  options={[
                    { id: 2, name: "2x" },
                    { id: 3, name: "3x" },
                    { id: 4, name: "4x" },
                    { id: 5, name: "5x" },
                    { id: 6, name: "6x" },
                    { id: 7, name: "7x" },
                    { id: 8, name: "8x" },
                    { id: 9, name: "9x" },
                    { id: 10, name: "10x" },
                    { id: 11, name: "11x" },
                    { id: 12, name: "12x" },
                  ]}
                />
                <ControlledDateTimePicker
                  control={control}
                  name="paymentInInstallments.dueDate"
                  showTime={false}
                  label="Vencimento da 1ª Parcela *"
                  placeholder=""
                />

                <ControlledSelect
                  control={control}
                  name="paymentInInstallments.interval"
                  label="Intervalo *"
                  placeholder="Selecione o intervalo"
                  options={[
                    { id: 15, name: "15 dias" },
                    { id: 30, name: "30 dias" },
                    { id: 45, name: "45 dias" },
                    { id: 60, name: "60 dias" },
                  ]}
                />
                <ControlledSelect
                  control={control}
                  name="paymentMethod"
                  label="Metodo de Pagamento"
                  placeholder="Selecione o metado de pagamento"
                  options={[
                    { id: PaymentMethod.cash, name: "Dinheiro" },
                    { id: PaymentMethod.pix, name: "Pix" },
                    { id: PaymentMethod.creditCard, name: "Cartão" },
                    { id: PaymentMethod.transfer, name: "Transferência" },
                  ]}
                />
              </div>
            )}

            <Card className="my-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                <CardTitle className="text-sm font-medium">
                  Preview das Parcelas
                </CardTitle>
              </CardHeader>
              <ScrollArea className="max-h-[200px] w-full overflow-auto">
                <CardContent className="flex flex-col gap-2 pt-4">
                  {installmentPreview.length > 0 ? (
                    installmentPreview.map((item) => (
                      <div
                        key={item.installment}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>{item.installment}ª parcela:</span>
                        <div>
                          <span className="font-medium text-right">
                            {formatCurrency(item.price)}
                          </span>
                          <span>
                            - Venc:{" "}
                            <span className="font-medium">
                              {formatDate(item.dueDate, "dd/MM/yyyy")}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Aguardando informações para gerar o preview.
                    </p>
                  )}
                </CardContent>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </Card>
            <ControlledTextarea
              control={control}
              name="description"
              label="Observações"
              limit={100}
              placeholder="Observações sobre a venda"
            />
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <Card className="mt-6 p-4 flex justify-between items-center bg-muted/50">
          <h3 className="text-lg font-semibold">Total da Venda</h3>
          <p className="text-2xl font-bold">
            {totalSale.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Registrando..." : "Registrar Venda"}
        </Button>
      </form>
    </FormProvider>
  );
}
