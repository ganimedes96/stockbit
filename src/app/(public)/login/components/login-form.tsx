"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {  Lock, Mail, Package } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log("Login result:", result);
      

      if (result?.error) {
        console.error("Login error:", result.error);
        setError("Credenciais inválidas. Tente novamente.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold">StockBit</span>
        </div>
        <h2 className="text-2xl">Bem-vindo de volta</h2>
        <p>Entre com suas credenciais para acessar sua conta</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            iconPosition="left"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            icon={<Lock className="h-4 w-4" />}
            iconPosition="left"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <div className="text-center text-sm">
        Não tem uma conta?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
