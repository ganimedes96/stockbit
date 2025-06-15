"use client";
import { updateProfile } from "@/domain/user/actions";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/domain/user/types";
import { getUserInitials } from "@/utils/get-user-initials";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z, infer as zInfer } from "zod";
import { ControlledImageProfile } from "@/components/form/controllers/controlled-image-profile";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(3, "O primeiro nome deve ter pelo menos 3 caracteres"),
  lastName: z.string().min(3, "O sobrenome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  photo: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .refine(
      (file) =>
        typeof file === "string" ||
        (file && ALLOWED_IMAGE_TYPES.includes(file.type)),
      "Formato de imagem inválido (apenas JPEG, PNG ou WEBP)"
    )
    .refine(
      (file) =>
        typeof file === "string" || (file && file.size <= MAX_FILE_SIZE),
      "A imagem deve ter no máximo 5MB"
    ),
  company: z.object({
    name: z.string().min(3, "Nome da empresa é obrigatório"),
    address: z.string().min(3, "Endereço é obrigatório"),
    cnpj: z.string().optional(),
  }),
});

export function UserProfile({ user }: { user: User }) {
  const defaultValues = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
    photo: user.imagePath || "",
    company: {
      name: user.company?.name || "",
      address: user.company?.address || "",
      cnpj: user.company?.cnpj || "",
    },
  };

  const {
    control,
    handleSubmit,
    reset,

    formState: { isDirty, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const isAvatarDirty = watch("photo") !== user.imagePath;

  type UserSchema = zInfer<typeof profileSchema>;

  const onSubmit = async (data: UserSchema) => {
    try {
      const success = await updateProfile({
        ...data,
        photo: typeof data.photo === "string" ? undefined : data.photo,
      });

      if (success) {
        toast.success("Perfil atualizado com sucesso!");

        reset(data);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Suas informações de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <ControlledImageProfile
                control={control}
                name="photo"
                isDirty={isAvatarDirty}
                imageUrl={user.imagePath}
                label=""
                fallback={getUserInitials(user.firstName)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full">
              <div className="w-full md:w-1/2 space-y-4">
                <ControlledInput
                  control={control}
                  name="firstName"
                  label="Seu primeiro"
                  placeholder="Seu primeiro nome"
                />
                <ControlledInput
                  control={control}
                  name="lastName"
                  label="Seu sobrenome"
                  placeholder="Seu sobrenome"
                />
                <ControlledInput
                  control={control}
                  readOnly
                  name="email"
                  label="Email - (Não editável)"
                  placeholder="Seu email"
                  className="cursor-not-allowed text-zinc-500"
                />
                <ControlledInput
                  control={control}
                  name="phone"
                  maskType="phoneMobile"
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                <ControlledInput
                  control={control}
                  name="company.address"
                  label="Endereço"
                  placeholder="Rua, número, complemento"
                />
                <ControlledInput
                  control={control}
                  name="company.name"
                  label="Nome da Empresa"
                  placeholder="Nome completo da empresa"
                />
               
               
                <ControlledInput
                  control={control}
                  name="company.cnpj"
                  label="CNPJ"
                  maskType="cnpj"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            {isDirty && (
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => reset(defaultValues)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
