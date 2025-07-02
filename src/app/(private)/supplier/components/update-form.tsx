"use client";

import { StatusServer } from "@/api/types";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { Button } from "@/components/ui/button";
import {
  useUpdateSupplier,
} from "@/domain/supplier/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ControlledRadioGroup } from "@/components/form/controllers/controlled-radio-group";
import z from "zod";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { Supplier } from "@/domain/supplier/types";

const onlyNumbers = (value: string) => value.replace(/\D/g, "");

export const supplierSchema = z
  .object({
    // Campos obrigatórios
    name: z.string().min(1, "O nome do fornecedor é obrigatório."),
    address: z.object({
      zipCode: z.string().min(8, "O CEP deve ter 8 dígitos."),
      city: z.string().min(1, "A cidade é obrigatória."),
      state: z.string().min(1, "O estado é obrigatório."),
    }),

    // Campos opcionais
    type: z.enum(["PF", "PJ"]).optional(),
    document: z.string().optional(),
    legalName: z.string().optional(), // Razão Social
    email: z
      .string()
      .email("Formato de e-mail inválido.")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    defaultPaymentTerms: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validação condicional: só valida o documento SE um tipo for selecionado
    if (data.type && data.document) {
      const doc = onlyNumbers(data.document);
      if (data.type === "PF" && doc.length > 0 && doc.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF inválido. Deve conter 11 dígitos.",
          path: ["document"],
        });
      }
      if (data.type === "PJ" && doc.length > 0 && doc.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CNPJ inválido. Deve conter 14 dígitos.",
          path: ["document"],
        });
      }
    }
  });

export type FormSupplierSchema = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier: Supplier;
  companyId: string;
  onSuccess: () => void;
}

export function UpdateForm({
  companyId,
  onSuccess,
  supplier,
}: SupplierFormProps) {
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const { mutateAsync, isPending } = useUpdateSupplier(companyId);

  const methods = useForm<FormSupplierSchema>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier.name,
      document: supplier.document ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      legalName: supplier.legalName ?? "",
      address: {
        zipCode: supplier.address.zipCode,
        city: supplier.address.city,
        state: supplier.address.state,
      },
      description: supplier.description ?? "",
      defaultPaymentTerms:
        supplier.defaultPaymentTerms !== undefined &&
        supplier.defaultPaymentTerms !== null
          ? String(supplier.defaultPaymentTerms)
          : "30 dias", // Valor padrão para condições de pagamento
      // alor padrão para condições de pagamento
      type: supplier.type, // Valor padrão para tipo de pessoa
    },
  });

  const { control, reset, handleSubmit, watch, setValue } = methods;

  const personType = watch("type");
  const zipCode = watch("address.zipCode");

  // Efeito para buscar o endereço via CEP
  useEffect(() => {
    const cleanedZipCode = zipCode?.replace(/\D/g, "") || "";
    if (cleanedZipCode.length !== 8) return;

    const fetchAddress = async () => {
      setIsFetchingAddress(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanedZipCode}/json/`
        );
        const data = await response.json();
        if (!data.erro) {
          // ATUALIZADO: Preenche apenas os campos existentes na sua nova tipagem
          setValue("address.city", data.localidade);
          setValue("address.state", data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsFetchingAddress(false);
      }
    };
    fetchAddress();
  }, [zipCode, setValue]);

  const onSubmit = async (data: FormSupplierSchema) => {
    try {
      await mutateAsync(
        { ...data, id: supplier.id, updatedAt: new Date() },
        {
          onSuccess: (response) => {
            if (response.status === StatusServer.success) {
              onSuccess();
              reset();
            }
          },
        }
      );
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Seção de Informações Principais */}
      <div>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <ControlledInput
            control={control}
            name="name"
            label="Nome do Fornecedor *"
            placeholder="Nome Fantasia ou Completo"
          />
          <ControlledInput
            control={control}
            name="legalName"
            label="Razão Social"
            placeholder="Nome legal da empresa (se aplicável)"
          />
          <ControlledRadioGroup
            control={control}
            name="type"
            label="Tipo de Pessoa"
            options={[
              { label: "Pessoa Jurídica", value: "PJ" },
              { label: "Pessoa Física", value: "PF" },
            ]}
          />
          <ControlledInput
            control={control}
            name="document"
            label={personType === "PJ" ? "CNPJ" : "CPF"}
            maskType={personType === "PJ" ? "cnpj" : "cpf"}
            placeholder={personType === "PJ" ? "Digite o CNPJ" : "Digite o CPF"}
            key={personType}
          />
        </div>
      </div>

      {/* Seção de Contato e Endereço */}
      <div>
        <h3 className="text-lg font-medium">Contato e Localização</h3>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <ControlledInput
            control={control}
            name="phone"
            label="Telefone"
            maskType="phoneMobile"
            placeholder="(99) 99999-9999"
          />
          <ControlledInput
            control={control}
            name="email"
            label="E-mail"
            type="email"
            placeholder="contato@fornecedor.com"
          />
          <ControlledInput
            control={control}
            name="address.zipCode"
            label="CEP *"
            maskType="cep"
            placeholder="00000-000"
          />
          <ControlledInput
            placeholder=""
            control={control}
            name="address.city"
            label="Cidade *"
            disabled={isFetchingAddress}
          />
          <ControlledInput
            placeholder=""
            control={control}
            name="address.state"
            label="Estado *"
            disabled={isFetchingAddress}
          />
        </div>
      </div>

      {/* Seção de Outras Informações */}
      <div>
        <h3 className="text-lg font-medium">Outras Informações</h3>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <ControlledSelect
            control={control}
            options={[
              { id: "30", name: "30 dias" },
              { id: "60", name: "60 dias" },
              { id: "90", name: "90 dias" },
              { id: "120", name: "120 dias" },
            ]}
            name="defaultPaymentTerms"
            label="Condições de Pagamento Padrão"
            placeholder="Ex: 30 dias, 50% adiantado"
          />
        </div>
        <ControlledTextarea
          placeholder="Digite suas observações "
          className="mt-4"
          control={control}
          name="description"
          label="Observações"
          limit={200}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar Fornecedor"}
      </Button>
    </form>
  );
}
