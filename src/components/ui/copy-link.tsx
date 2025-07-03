"use client";

import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CopyLinkProps {
  pathname: string;
  title: string;
  available?: boolean;
}

export function CopyLink({ pathname, title, available }: CopyLinkProps) {
  const router = useRouter();
  const copyBookingLink = async () => {
    if (!available) {
      toast.error("Você não possui mais acesso", {
        action: {
          label: "Upgrade",
          onClick: () => {
            if (router) {
              router.push("/upgrade");
            }
          },
        },
      });
      return;
    }
    try {
      const bookingLink = `${window.location.origin}/${pathname}`;
      await navigator.clipboard.writeText(bookingLink);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      toast.error("Falha ao copiar o link");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2"
      onClick={copyBookingLink}
      size="sm"
    >
      {title} <Link size={16} />
    </Button>
  );
}
