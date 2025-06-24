"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent, // Importe o DialogContent para envolver o conteúdo
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetDebtorsByClientId } from "@/domain/debtors/queries";
import { useProductList } from "@/domain/product/queries";
import { User } from "@/domain/user/types";
import { formatCurrency } from "@/utils/text/format";
import { DebtCard } from "./debto-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface DebtorDetailsModalProps {
  user: User;
  debtor: {
    client: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
    id: string;
    lastPurchase: Date;
    overdueAmount: number;
    status: "Em dia" | "Em atraso" | "Sem dívidas";
    totalOwed?: number;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DebtorDetailsModal({
  user,
  debtor,
  open,
  setOpen,
}: DebtorDetailsModalProps) {
  const { data: detailedDebts, isLoading } = useGetDebtorsByClientId(
    debtor?.client.id ?? "",
    user.company.id,
    {
      enabled: !!debtor?.client.id,
    }
  );
  const { data: products } = useProductList(user.company.id);
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* É uma boa prática envolver o conteúdo do modal com DialogContent */}
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Cliente</DialogTitle>
          <DialogDescription>
            Histórico de compras e pagamentos de {debtor.client?.name}
          </DialogDescription>
        </DialogHeader>

       
        {isLoading ? (
          <p>Carregando dívidas...</p>
        ) : (
          <div className="space-y-6">
            <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4  rounded-lg">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p>{debtor.client.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Telefone</Label>
                <p>{debtor.client.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">E-mail</Label>
                <p>{debtor.client.email}</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm">Total Devido</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {formatCurrency(debtor.totalOwed ?? 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm">Em Atraso</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(debtor.overdueAmount)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <p className="text-sm">Status Geral</p>
                  <Badge
                    className="mt-1 text-base"
                    variant={
                      (debtor.status === "Em dia" || debtor.status === "Sem dívidas") ? "success" : "destructive"
                    }
                  >
                    {debtor.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>
            <h2 className="text-xl font-medium ">Histórico de Vendas</h2>
           {detailedDebts && detailedDebts.length > 0 ? (
              <ScrollArea className="h-[450px] w-full">
                <div className="space-y-4 pr-4">
                    {detailedDebts.map((d, index) => (
                    <DebtCard 
                        companyId={user.company.id}
                        key={d.id} 
                        debt={d} 
                        productsList={products} 
                        index={index} 
                    />
                    ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-48">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">Tudo em ordem!</p>
                <p className="text-sm text-muted-foreground">
                  Este cliente não possui nenhuma dívida no momento.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
