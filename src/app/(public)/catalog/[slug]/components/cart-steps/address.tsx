"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select"; // Supondo que você tenha este componente

import { ControlledRadioGroup } from "@/components/form/controllers/controlled-radio-group";
import { House, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetNeighborhoods } from "@/domain/neighborhoods/queries";
import { User } from "@/domain/user/types";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";

const CUSTOMER_DATA_KEY = "checkoutCustomerData";
interface NeighborhoodProps {
  user: User;
}

export function AddressStep({ user }: NeighborhoodProps) {
  // PASSO 2: Pegamos tudo o que precisamos do contexto do formulário pai.
  // O <FormProvider> no GlobalFormSheet garante que isso funcione.
  const { control, watch, setValue } = useFormContext();
  const { data: neighborhoodOptions } = useGetNeighborhoods(user.company.id);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  useEffect(() => {
    // Roda apenas uma vez quando o componente é montado
    try {
      const savedDataString = localStorage.getItem(CUSTOMER_DATA_KEY);
      if (savedDataString) {
        const savedData = JSON.parse(savedDataString);
        // Usamos 'setValue' para pré-preencher o formulário com os dados salvos
        if (savedData.customerName)
          setValue("customerName", savedData.customerName);
        if (savedData.customerEmail)
          setValue("customerEmail", savedData.customerEmail);
        if (savedData.customerPhone)
          setValue("customerPhone", savedData.customerPhone);
        if (savedData.zipCode) setValue("zipCode", savedData.zipCode);
        if (savedData.street) setValue("street", savedData.street);
        if (savedData.number) setValue("number", savedData.number);
        if (savedData.complement) setValue("complement", savedData.complement);
        if (savedData.city) setValue("city", savedData.city);
        if (savedData.state) setValue("state", savedData.state);
      }
    } catch (error) {
      console.error(
        "Falha ao carregar dados do cliente do localStorage",
        error
      );
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      const toSave = {
        customerName: value.customerName,
        customerEmail: value.customerEmail,
        customerPhone: value.customerPhone,
        zipCode: value.zipCode,
        street: value.street,
        number: value.number,
        complement: value.complement,
        neighborhood: value.neighborhood,
        city: value.city,
        state: value.state,
      };
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(toSave));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const deliveryMethod = watch("deliveryMethod");
  const zipCode = watch("zipCode");

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
          setValue("street", data.logradouro, {
            shouldValidate: true,
          });

          setValue("city", data.localidade, {
            shouldValidate: true,
          });
          setValue("state", data.uf, { shouldValidate: true });
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
        <div className="space-y-4">
          <ControlledInput
            control={control}
            required
            rules={{ required: "O nome do cliente é obrigatório" }}
            name="customerName"
            label="Nome do Cliente *"
            placeholder="Ex: João da Silva"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <ControlledInput
              control={control}
              name="customerEmail"
              label="E-mail do Cliente"
              placeholder="Ex: seu@example.com"
            />
            <ControlledInput
              control={control}
              required
              type="tel"
              rules={{ required: "O telefone do cliente é obrigatório" }}
              name="customerPhone"
              label="Telefone (Whatsapp) *"
              maskType="phoneMobile"
              placeholder="(00) 00000-0000"
            />
          </div>

          <ControlledInput
            control={control}
            required
            rules={{ required: "O CEP é obrigatório" }}
            name="zipCode"
            label="CEP *"
            maskType="cep"
            placeholder="00000-000"
          />

          <ControlledInput
            control={control}
            required
            rules={{ required: "A rua ou avenida é obrigatória" }}
            name="street"
            label="Rua / Avenida *"
            placeholder="Ex: Av. Paulista"
            disabled={isFetchingAddress}
          />

          <div className="grid grid-cols-[1fr_0.6fr] gap-4">
            <ControlledSelect
              control={control}
              rules={{ required: "O bairro é obrigatório" }}
              name="neighborhood"
              label="Bairro *"
              placeholder="Selecione um bairro"
              options={
                neighborhoodOptions
                  ?.filter((option) => option.isActive === true)
                  .map((option) => {
                    return {
                      id: option.id,
                      name: option.name,
                    };
                  }) || []
              }
              disabled={isFetchingAddress}
            />
            <ControlledInput
              control={control}
              required
              rules={{ required: "O número é obrigatório" }}
              name="number"
              label="Número *"
              placeholder="Ex: 123"
            />
          </div>
         <div className="grid grid-cols-[1fr_0.4fr] gap-4">

            <ControlledInput
              placeholder="Ex: São Paulo"
              control={control}
              rules={{ required: "A cidade é obrigatória" }}
              required
              name="city"
              label="Cidade *"
              disabled={isFetchingAddress}
            />
         
          
            <ControlledInput
              placeholder="Ex: SP"
              control={control}
              rules={{ required: "O estado é obrigatório" }}
              required
              name="state"
              label="Estado (UF) *"
              disabled={isFetchingAddress}
              maxLength={2}
            />
          
         </div>
          <ControlledTextarea
            control={control}
            name="complement"
            label="Complemento"
            placeholder="Apto, Bloco, etc."
            limit={100}
          />
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
                required
                rules={{ required: "O nome é obrigatório" }}
                name="customerName"
                label="Nome de quem irá retirar *"
                placeholder="Ex: João da Silva"
              />
            </div>

            <ControlledInput
              control={control}
              required
              rules={{ required: "O telefone do cliente é obrigatório" }}
              name="customerPhone"
              label="Telefone (Whatsapp) *"
              maskType="phoneMobile"
              placeholder="(00) 00000-0000"
            />
            <ControlledInput
              control={control}
              name="customerEmail"
              label="E-mail (Opcional)"
              placeholder="Ex: seu@example.com"
            />
          </div>
        </div>
      )}
    </div>
  );
}
