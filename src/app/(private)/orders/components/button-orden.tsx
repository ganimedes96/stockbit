"use client";

import Link from "next/link";
import React from "react";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  children: React.ReactNode; // Aceita filhos para o texto do botão/item de menu
  className?: string;
  asChild?: boolean; // Para integração com outros componentes Shadcn
}

export function ButtonOrden({ phone, message, children, className }: WhatsAppButtonProps) {
  // 1. Remove caracteres não numéricos do telefone
  const cleanedPhone = phone.replace(/\D/g, "");
  
  // 2. Codifica a mensagem para ser segura para uma URL
const encodedMessage = encodeURIComponent(message);


  // 3. Monta o link final
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;

  return (
    <Link href={whatsappUrl} target="_blank" className={className} passHref>
        {children}
    </Link>
  );
}