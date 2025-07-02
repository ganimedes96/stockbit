"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select"; // Supondo que você tenha este componente

import { z } from "zod";
import { finalCheckoutSchema } from "./schema";
import { ControlledRadioGroup } from "@/components/form/controllers/controlled-radio-group";
import { House, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetNeighborhoods } from "@/domain/neighborhoods/queries";
import { User } from "@/domain/user/types";

export type AddressFormValues = z.infer<typeof finalCheckoutSchema>;

const CUSTOMER_DATA_KEY = "checkoutCustomerData";
interface NeighborhoodProps {
  user: User
}

export function AddressStep({ user }: NeighborhoodProps) {
  // PASSO 2: Pegamos tudo o que precisamos do contexto do formulário pai.
  // O <FormProvider> no GlobalFormSheet garante que isso funcione.
  const { control, watch, setValue } = useFormContext<AddressFormValues>();
  const  {data:neighborhoodOptions} = useGetNeighborhoods(user.company.id);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  useEffect(() => {
    // Roda apenas uma vez quando o componente é montado
    try {
      const savedDataString = localStorage.getItem(CUSTOMER_DATA_KEY);
      if (savedDataString) {
        const savedData = JSON.parse(savedDataString);
        // Usamos 'setValue' para pré-preencher o formulário com os dados salvos
        if (savedData.customerName)
          setValue("shippingAddress.customerName", savedData.customerName);
        if (savedData.customerEmail)
          setValue("shippingAddress.customerEmail", savedData.customerEmail);
        if (savedData.customerPhone)
          setValue("shippingAddress.customerPhone", savedData.customerPhone);
        if (savedData.zipCode)
          setValue("shippingAddress.zipCode", savedData.zipCode);
        // ... e assim por diante para todos os outros campos de endereço ...
        if (savedData.street)
          setValue("shippingAddress.street", savedData.street);
        if (savedData.number)
          setValue("shippingAddress.number", savedData.number);
        if (savedData.complement)
          setValue("shippingAddress.complement", savedData.complement);
        if (savedData.neighborhood)
          setValue("shippingAddress.neighborhood", savedData.neighborhood);
        if (savedData.city) setValue("shippingAddress.city", savedData.city);
        if (savedData.state) setValue("shippingAddress.state", savedData.state);
      }
    } catch (error) {
      console.error(
        "Falha ao carregar dados do cliente do localStorage",
        error
      );
    }
  }, [setValue]);

  useEffect(() => {
    // Este efeito observa as mudanças nos dados do endereço
    const subscription = watch((value, { name }) => {
      // Se um campo dentro de 'shippingAddress' mudou, salvamos o objeto inteiro.
      if (name?.startsWith("shippingAddress")) {
        localStorage.setItem(
          CUSTOMER_DATA_KEY,
          JSON.stringify(value.shippingAddress)
        );
      }
    });
    // Limpa a inscrição quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, [watch]);

  const deliveryMethod = watch("deliveryMethod");
  const zipCode = watch("shippingAddress.zipCode");

  // A lógica do ViaCEP permanece a mesma, pois ela usa 'watch' e 'setValue' do contexto.
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
          setValue("shippingAddress.street", data.logradouro, {
            shouldValidate: true,
          });
          setValue("shippingAddress.neighborhood", data.bairro, {
            shouldValidate: true,
          });
          setValue("shippingAddress.city", data.localidade, {
            shouldValidate: true,
          });
          setValue("shippingAddress.state", data.uf, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsFetchingAddress(false);
      }
    };

    fetchAddress();
  }, [zipCode, setValue]);

  // PASSO 3: O retorno é apenas o JSX dos campos, sem a tag <form> ou botão de submit.
  return (
    <div className="space-y-6">
      <ControlledRadioGroup
        control={control}
        label="Escolha uma opção: *"
        name="deliveryMethod"
        displayAs="card"
        options={[
          { value: "delivery", label: "Receber em Casa", icon: House },
          { value: "pickup", label: "Retirar na Loja", icon: MapPin },
        ]}
      />
      {deliveryMethod === "delivery" && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className=" flex flex-col md:col-span-6">
            <div className="w-full ">
              <ControlledInput
                control={control}
                required
                rules={{ required: "O nome do cliente é obrigatório" }}
                name="shippingAddress.customerName"
                label="Nome do Cliente *"
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="w-full md:grid md:grid-cols-2 md:gap-4 mt-4">
              <ControlledInput
                control={control}
                name="shippingAddress.customerEmail"
                label="E-mail do Cliente"
                placeholder="Ex: seu@example.com"
              />
              <ControlledInput
                control={control}
                name="shippingAddress.customerPhone"
                label="Telefone (Whatsapp) *"
                maskType="phoneMobile"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <ControlledInput
              control={control}
              name="shippingAddress.zipCode"
              label="CEP *"
              maskType="cep"
              placeholder="00000-000"
            />
          </div>
          <div className="md:col-span-4">
            <ControlledInput
              control={control}
              name="shippingAddress.street"
              label="Rua / Avenida *"
              placeholder="Ex: Av. Paulista"
              disabled={isFetchingAddress}
            />
          </div>
          <div className="md:col-span-2">
            <ControlledInput
              control={control}
              name="shippingAddress.number"
              label="Número *"
              placeholder="Ex: 123"
            />
          </div>
          <div className="md:col-span-4">
            <ControlledInput
              control={control}
              name="shippingAddress.complement"
              label="Complemento"
              placeholder="Apto, Bloco, etc."
            />
          </div>
          <div className="md:col-span-2">
            <ControlledSelect
              control={control}
              name="shippingAddress.neighborhood"
              label="Bairro *"
              placeholder="Selecione um bairro"
              options={neighborhoodOptions?.filter((option) => option.isActive === true ).map((option) => {
                return {
                  id: option.id,
                  name: option.name
                }
              }) || []}
              disabled={isFetchingAddress}
            />
          </div>
          <div className="md:col-span-2">
            <ControlledInput
              placeholder="Ex: São Paulo"
              control={control}
              name="shippingAddress.city"
              label="Cidade *"
              disabled={isFetchingAddress}
            />
          </div>
          <div className="md:col-span-2">
            <ControlledInput
              placeholder="Ex: SP"
              control={control}
              name="shippingAddress.state"
              label="Estado (UF) *"
              disabled={isFetchingAddress}
              maxLength={2}
            />
          </div>
        </div>
      )}
      {deliveryMethod === "pickup" && (
        <div className="space-y-4 pt-4  animate-in fade-in-50">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <MapPin className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold">Informações para Retirada</p>
                <p className="text-sm text-muted-foreground">
                  O pedido será preparado para retirada no endereço da loja.
                  <br />
                  Aguarde a confirmação por e-mail/whatsapp.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* O campo de nome ocupa a largura total no desktop (2 colunas) */}
            <div className="md:col-span-2">
              <ControlledInput
                control={control}
                name="shippingAddress.customerName"
                label="Nome de quem irá retirar *"
                placeholder="Ex: João da Silva"
              />
            </div>

            <ControlledInput
              control={control}
              name="shippingAddress.customerPhone"
              label="Telefone (Whatsapp) *"
              maskType="phoneMobile"
              placeholder="(00) 00000-0000"
            />
            <ControlledInput
              control={control}
              name="shippingAddress.customerEmail"
              label="E-mail (Opcional)"
              placeholder="Ex: seu@example.com"
            />
          </div>
        </div>
      )}
    </div>
  );
}
