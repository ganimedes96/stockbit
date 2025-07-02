
"use client";
import type React from "react";
import { User } from "@/domain/user/types";
import { getUserInitials } from "@/utils/get-user-initials";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RegisterOrder } from "./cart-steps/register-order";


// Componente do Botão do Carrinho

interface HeaderProps {
  children?: React.ReactNode;
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex flex-col items-center border-b bg-sidebar-foreground px-4 w-full sticky top-0 z-50">
      <div className="w-full max-w-7xl py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.imagePath} alt={user.firstName} />
            <AvatarFallback>
              {getUserInitials(`${user.firstName} ${user.lastName}`)}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-xl text-sidebar-primary font-bold hidden sm:block">
            {user.company.name}
          </h1>
        </div>

        {/* O FormSheet agora usa nosso CartButton como gatilho */}
        <RegisterOrder user={user} />
      </div>
    </header>
  );
}
