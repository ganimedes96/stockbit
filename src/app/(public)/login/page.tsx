import { CheckCircle, Clock, Package, Shield } from "lucide-react";
import { LoginForm } from "./components/login-form";
import Link from "next/link";

export default function Login() {
  return (
    <div className="grid h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center space-x-2">
              <div className="bg-background border border-divider w-10 h-10 rounded flex items-center justify-center font-bold text-secondary-foreground">
                SB
              </div>
              <span className="font-bold text-lg">StockBit</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className=" hidden dark:bg-black/50 bg-zinc-900 lg:block overflow-hidden">
        <div className="h-full flex flex-col items-center justify-center gap-6 p-10">
          <div className="items-center justify-center  text-center transform transition-all flex flex-col gap-4">
            <Package className="h-20 w-20 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">{"Bem-vindo de volta!"}</h2>
            <p className="text-muted-foreground text-lg">
              {
                "Acesse sua conta e continue gerenciando seu estoque com eficiência."
              }
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-background/50 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <div className="font-semibold">Controle Total</div>
              </div>
              <div className="text-sm text-muted-foreground">Gerencie produtos, entradas e saídas em tempo real</div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center mb-3">
                <Shield className="h-6 w-6 text-blue-500 mr-3" />
                <div className="font-semibold">Segurança Avançada</div>
              </div>
              <div className="text-sm text-muted-foreground">Seus dados protegidos com criptografia de ponta</div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center mb-3">
                <Clock className="h-6 w-6 text-orange-500 mr-3" />
                <div className="font-semibold">Suporte 24/7</div>
              </div>
              <div className="text-sm text-muted-foreground">Equipe sempre disponível para ajudar você</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
