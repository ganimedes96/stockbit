"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  Dock,
  LockIcon,
  Mail,
  MapIcon,
  Package,
  Phone,
  User,
} from "lucide-react";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { useCreateCompany } from "@/domain/company/queries";
import { StatusServer } from "@/api/types";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(3, "O primeiro nome deve ter pelo menos 3 caracteres"),
    lastName: z.string().min(3, "O sobrenome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Formato de e-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    phone: z.string().min(1, "O telefone e obrigatório"),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
    company: z.object({
      name: z
        .string()
        .min(3, "O nome da empresa deve ter pelo menos 3 caracteres"),
      
      address: z.string().min(3, "O endereço deve ter pelo menos 3 caracteres"),
      cnpj: z.string().optional(),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export function FormRegister() {
  const { mutateAsync } = useCreateCompany();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      confirmPassword: "",
      company: {
        name: "",
       
        address: "",
        cnpj: "",
      },
    },
  });

  console.log(errors);

  async function onSubmit(data: RegisterFormData) {
    console.log(data);

    await mutateAsync(
      {
        ...data,
        role: "admin",
        company: {
          ...data.company,
          cnpj: data.company?.cnpj ?? "",
        },
      },
      {
        onSuccess: (response) => {
          if (response.status === StatusServer.success) {
            reset();
          }
        },
      }
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold">StockBit</span>
        </div>
        <CardTitle className="text-2xl">Criar sua conta</CardTitle>
        <CardDescription>
          Preencha os dados para começar seu teste gratuito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ControlledInput
              control={control}
              iconPosition="left"
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              placeholder="Joaquim"
              name="firstName"
              label="Nome *"
            />
            <ControlledInput
              control={control}
              placeholder="Silva"
              name="lastName"
              label="Sobrenome *"
            />
          </div>
          <ControlledInput
            control={control}
            placeholder="Nome da sua empresa"
            name="company.name"
            iconPosition="left"
            icon={<Building className="h-4 w-4 text-muted-foreground" />}
            label="Nome da empresa *"
          />
          <ControlledInput
            control={control}
            placeholder="Endereço"
            name="company.address"
            iconPosition="left"
            icon={<MapIcon className="h-4 w-4 text-muted-foreground" />}
            label="Endereço"
          />
          <ControlledInput
            control={control}
            iconPosition="left"
            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
            placeholder="E-mail"
            name="email"
            label="E-mail"
          />
          <ControlledInput
            control={control}
            placeholder="Telefone"
            maskType="phoneMobile"
            name="phone"
            iconPosition="left"
            icon={<Phone className="h-4 w-4 text-muted-foreground" />}
            label="Telefone"
          />
          <ControlledInput
            control={control}
            placeholder="CNPJ"
            name="company.cnpj"
            maskType="cnpj"
            iconPosition="left"
            icon={<Dock className="h-4 w-4 text-muted-foreground" />}
            label="CNPJ"
          />
          <div className="grid grid-cols-2 gap-4">
            <ControlledInput
              control={control}
              placeholder="minimo 6 caracteres"
              name="password"
              iconPosition="left"
              icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
              label="Senha"
              type="password"
            />

            <ControlledInput
              control={control}
              iconPosition="left"
              icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
              placeholder="Digite a mesma senha"
              name="confirmPassword"
              label="Confirmar senha"
              type="password"
            />
          </div>
          <Button className="w-full" type="submit">
            Criar conta
          </Button>
          {Object.entries(errors).map(([key, value]) => (
            <p key={key} className="text-red-500 text-sm">
              {key}: {("message" in value && typeof value.message === "string") ? value.message : ""}
            </p>
          ))}
        </form>
      </CardContent>
    </Card>
  );
}
