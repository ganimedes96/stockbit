import { getUser } from "@/domain/user/server";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLogout } from "@/components/header/button-logout";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Sua sessão expirou.</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Por favor, faça login novamente para continuar acessando o
              sistema.
            </p>
          </CardContent>
          <CardFooter>
            <ButtonLogout showDialog={false} />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user?.active) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Conta desativada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Sua conta foi desativada. Entre em contato com o suporte para mais
              informações.
            </p>
          </CardContent>
          <CardFooter>
            <ButtonLogout showDialog={false} />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <div className="w-full flex flex-col overflow-hidden">{children}</div>;
}
