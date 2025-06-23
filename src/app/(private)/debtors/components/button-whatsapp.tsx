import { Button } from "@/components/ui/button";
import Image from "next/image";
import WhatsappIcon from "@/assets/whatsapp.svg";
import Link from "next/link";

interface WhatsAppButtonProps {
  phone: string;
  isMobile?: boolean;
  buttonText?: string;
  message: string;
  variant?: "ghost" | "outline" | "default" | "destructive" | "secondary";
}

export function WhatsAppButton({ phone, buttonText, message,isMobile, variant = "ghost" }: WhatsAppButtonProps) {
  return (
    <Link href={`https://wa.me/${phone}?text=${message}`} target="_blank">
      <Button
        variant={variant}
        size="icon"
        aria-label="Enviar mensagem pelo WhatsApp"
        className={`max-sm:w-full max-sm:border-none sm:hover:bg-transparent ${isMobile ? "p-0" : "p-1"}`}
      >
        <Image src={WhatsappIcon} width={isMobile ? 16 : 20} height={isMobile ? 1 : 20} alt="Botão WhatsApp" />
        {buttonText}
      </Button>
    </Link>
  );
}
