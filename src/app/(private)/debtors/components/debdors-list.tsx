"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDebtors } from "@/domain/debtors/queries";
import { User } from "@/domain/user/types";
import { Eye, Package, Plus, Search } from "lucide-react";
import { OverviewDebtors } from "./overview-debtors";
import { FormModal } from "@/components/form/containers/form-modal";
import { Button } from "@/components/ui/button";
import { DebdorForm } from "./debdor-form";
import { useClientList } from "@/domain/clients/queries";
import { useMemo, useState } from "react";
import { Client } from "@/domain/clients/types";
import { StatusDebtor } from "@/domain/debtors/types";
import { formatCurrency } from "@/utils/text/format";
import { format } from "date-fns";
import { calculateOverdueAmount, calculateTotalOwedForDebt } from "./helpers";
import { WhatsAppButton } from "./button-whatsapp";
import { DebtorDetailsModal } from "./debdor-details-modal";

interface DebtorsListProps {
  user: User;
}

type AggregatedDebtorData = {
  client: Client;
  id: string;
  totalOwed: number;
  overdueAmount: number;
  lastPurchase: Date | null;
  status: "Em dia" | "Em atraso" | "Sem dívidas";
};

export function DebtorsList({ user }: DebtorsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDebtor, setSelectedDebtor] =
    useState<AggregatedDebtorData | null>(null);

  const { data: debtors } = useGetDebtors(user.company.id);
  const { data: clients, isLoading: isLoadingClients } = useClientList(
    user.company.id
  );

  const debtorsList = useMemo((): AggregatedDebtorData[] => {
    if (!clients || !debtors) {
      return [];
    }

    // O tipo para o objeto de agregação. Não precisa do 'id' aqui.
    type AggregationData = Omit<AggregatedDebtorData, "client" | "id">;
    const aggregatedData: Record<string, AggregationData> = {};
    const today = new Date();

    for (const debt of debtors) {
      if (!aggregatedData[debt.clientId]) {
        aggregatedData[debt.clientId] = {
          totalOwed: 0,
          overdueAmount: 0,
          lastPurchase: null,
          status: "Sem dívidas",
        };
      }

      const clientData = aggregatedData[debt.clientId];

      if (debt.statusDebtor !== StatusDebtor.paid) {
        clientData.totalOwed += calculateTotalOwedForDebt(debt);
        clientData.overdueAmount += calculateOverdueAmount(debt, today);
      }

      // LÓGICA DE ÚLTIMA COMPRA SIMPLIFICADA E CORRIGIDA
      // Se não houver uma data de última compra ou se a data da dívida atual for mais recente, atualize.
      if (
        !clientData.lastPurchase ||
        debt.createdAt > clientData.lastPurchase
      ) {
        clientData.lastPurchase = debt.createdAt;
      }
    }

   

    // O passo 2 agora irá incluir todos os clientes
    return (
      clients
        .map((client) => {
          // Fornece um objeto padrão para clientes que não estão no aggregatedData (não têm dívidas)
          const data = aggregatedData[client.id] || {
            totalOwed: 0,
            overdueAmount: 0,
            lastPurchase: null,
          };

          let status: AggregatedDebtorData["status"] = "Sem dívidas";

          if (data.totalOwed > 0) {
            status = data.overdueAmount > 0 ? "Em atraso" : "Em dia";
          }

          // Adicionamos o 'id' aqui, que deve vir do próprio cliente
          return { client, id: client.id, ...data, status };
        })
        // A LINHA DO FILTRO FOI REMOVIDA DAQUI
        .sort(
          (a, b) =>
            b.overdueAmount - a.overdueAmount || b.totalOwed - a.totalOwed
        )
    );
  }, [clients, debtors]);

   const filteredDebtorsList = useMemo(() => {
      let list = debtorsList;

      // Filtro por texto de busca (nome ou email)
      if (searchTerm) {
        list = list.filter(
          (item) =>
            item.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.client.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro por status
      if (statusFilter !== "all") {
        list = list.filter((item) => {
          if (statusFilter === "overdue") return item.status === "Em atraso";
          if (statusFilter === "due") return item.status === "Em dia";
          if (statusFilter === "paid") return item.status === "Sem dívidas";
          return true;
        });
      }

      return list;
    }, [debtorsList, searchTerm, statusFilter]);

  return (
    <div className="m-6 flex flex-col gap-6">
      <OverviewDebtors user={user} />
      <div className="flex justify-end">
        <FormModal
          title="Nova Venda a Prazo"
          description="Registre uma venda que será paga posteriormente"
          formComponent={DebdorForm}
          formProps={{
            companyId: user.company.id,
          }}
          customButton={
            <Button variant="default" size="lg" className="md:max-w-40 w-full">
                <Plus size={35} />
              Nova Venda          
            </Button>
          }
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Devedores</CardTitle>
          <CardDescription>
            Controle de clientes com pendências financeiras
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 p-6 border-b">
          <Input
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
            iconPosition="left"
            placeholder="Buscar por nome ou e-mail do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="overdue">Em atraso</SelectItem>
              <SelectItem value="due">Em dia</SelectItem>
              <SelectItem value="paid">Sem dívidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent>
          <ScrollArea className="max-h-[900px] w-full overflow-auto">
            <div className="min-w-[900px]">
              <Table className="mt-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Total Devido</TableHead>
                    <TableHead className="text-center">Em Atraso</TableHead>
                    <TableHead className="text-center">Última Compra</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingClients && (
                    <TableRow>
                      <TableCell colSpan={6}>Carregando clientes...</TableCell>
                    </TableRow>
                  )}
                  {!isLoadingClients &&
                    filteredDebtorsList.map((item) => {
                      return (
                        <TableRow key={item.client.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.client.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.client.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="flex justify-center ">
                            {formatCurrency(item.totalOwed)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.overdueAmount > 0 ? (
                              <span className="text-destructive font-semibold">
                                {formatCurrency(item.overdueAmount)}
                              </span>
                            ) : (
                              formatCurrency(0)
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.lastPurchase
                              ? format(item.lastPurchase, "dd/MM/yyyy")
                              : "Nenhuma dívida registrada"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                item.status === "Em atraso"
                                  ? "destructive"
                                  : "success"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-2 justify-center items-center">
                            <Button
                              onClick={() => setSelectedDebtor(item)}
                              variant="outline"
                              size="icon"
                            >
                              <Eye />
                            </Button>

                            <WhatsAppButton
                              variant="outline"
                              phone={item.client.phone || ""}
                              message={`Ola, ${item.client.name}!`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
          {!isLoadingClients && filteredDebtorsList.length === 0 && (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">
                Nenhum cliente com dívidas encontrado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedDebtor && (
        <DebtorDetailsModal
          user={user}
          debtor={{
            ...selectedDebtor,
            lastPurchase: selectedDebtor.lastPurchase ?? new Date(0),
          }}
          open={!!selectedDebtor}
          setOpen={() => setSelectedDebtor(null)}
        />
      )}
    </div>
  );
}
