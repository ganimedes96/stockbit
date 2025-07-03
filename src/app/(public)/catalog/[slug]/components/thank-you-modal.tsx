import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/domain/user/types";
import { applyMask, mask } from "@/utils/text/mask";
import { Mail } from "lucide-react";

const CUSTOMER_DATA_KEY = "checkoutCustomerData";

interface ThankYouModalProps {
  show: boolean;
  onClose: () => void;
  user: User;
}

export function ThankYouModal({ show, onClose, user }: ThankYouModalProps) {
  const [customerName, setCustomerName] = useState<string>("");

  useEffect(() => {
    const dataString = localStorage.getItem(CUSTOMER_DATA_KEY);
    if (dataString) {
      try {
        const data = JSON.parse(dataString);
        if (data.customerName) {
          setCustomerName(data.customerName);
        }
      } catch (e) {
        console.error("Erro ao ler dados do cliente do localStorage", e);
      }
    }
  }, [show]);

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Obrigado pela sua compra, {customerName || "Cliente"}! 🎉</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            Seu pedido foi recebido com sucesso e em breve entraremos em contato para confirmar os detalhes.
          </p>

          <div className="mt-4 space-y-1 text-sm">
            <p className="font-semibold">Empresa:</p>
            <p>{user.company.name}</p>
            <p>{user.company.address}</p>
            {user.company.cnpj && <p>CNPJ: {applyMask(user.company.cnpj, mask.cnpj)}</p>}
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <p className="font-semibold">Entre em contato se tiver dúvidas:</p>
            {user.phone && (
              <p>
                📞 <span className="text-primary">{applyMask(user.phone, mask.phoneMobile)}</span>
              </p>
            )}
            {user.email && (
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground"/> <span className="text-primary">{user.email}</span>
              </p>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Agradecemos por escolher a {user.company.name}!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
