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
import {
  useSupplierList,
  useUpdateSupplierStatus,
} from "@/domain/supplier/queries";
import { User } from "@/domain/user/types";
import { useDebounce } from "@/hooks/use-debounce";
import { Package, Plus, Search, SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "./table-skeleton"; // Importe o skeleton
import { WhatsAppButton } from "../../debtors/components/button-whatsapp";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { FormSupplier } from "./form-supplier";
import { UpdateForm } from "./update-form";
import { StatusSwitch } from "@/components/status-switch";
import { applyMask, mask } from "@/utils/text/mask";

interface SuppliersListProps {
  user: User;
}

export function SuppliersList({ user }: SuppliersListProps) {
  // 1. Estados para controlar os filtros da UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Hook de debounce para otimizar a busca por texto
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Busca inicial de dados
  const { data: suppliers, isLoading } = useSupplierList(user.company.id);
  const { mutate, isPending } = useUpdateSupplierStatus(user.company.id);
  // 2. Lógica de filtro e busca com useMemo para performance
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];

    return suppliers.filter((supplier) => {
      const search = debouncedSearchTerm.toLowerCase();

      // Filtro por texto: busca no nome, documento ou e-mail
      const matchesSearch =
        supplier.name.toLowerCase().includes(search) ||
        (supplier.document || "").toLowerCase().includes(search) ||
        (supplier.email || "").toLowerCase().includes(search);

      // LÓGICA DE FILTRO CORRIGIDA
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && supplier.status === true) ||
        (statusFilter === "inactive" && supplier.status === false);
      // Filtro por status
     
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, debouncedSearchTerm, statusFilter]);

  const handleMutate = (data: { id: string; status: boolean }) => {
    mutate({
      supplierId: data.id,
      status: data.status,
    });
  };

  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-end p-6">
        <FormSheet
          title="Adicionar Fornecedor"
          description="Registre um novo fornecedor"
          formComponent={FormSupplier}
          formProps={{ companyId: user.company.id }}
          side="right"
          customButton={
            <Button
              variant="default"
              size="sm"
              className="flex items-center justify-center w-full md:max-w-44"
            >
              <Plus size={35} />
              Registrar fornecedor
            </Button>
          }
        />
      </div>
      <Card className="mx-6 flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Fornecedores</CardTitle>
          <CardDescription>
            Gerencie os fornecedores da sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 3. Conexão dos filtros com os componentes de UI */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <Input
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              iconPosition="left"
              placeholder="Buscar por nome, CNPJ/CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. Estrutura completa da Tabela */}
          <Card className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 5. Lógica condicional para os 3 estados da tabela */}
                {isLoading ? (
                  <TableSkeleton columns={5} rows={5} />
                ) : filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.legalName || ""}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {applyMask(supplier.document || "", mask.cnpj,  ) || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{applyMask(supplier.phone || "", mask.phoneMobile,  ) || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">
                          {supplier.email || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.status === true
                              ? "success"
                              : "secondary"
                          }
                        >
                          {supplier.status === true ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <StatusSwitch
                            entity={supplier}
                            mutate={handleMutate}
                            isPending={isPending}
                            statusKey="status"
                          />
                          <FormSheet
                            title="Editar Fornecedor"
                            description="Edite as informações do fornecedor"
                            formComponent={UpdateForm}
                            formProps={{ companyId: user.company.id, supplier }}
                            customButton={
                              <Button variant="outline" size="icon">
                                <SquarePen />
                              </Button>
                            }
                          />
                          <WhatsAppButton
                            variant="outline"
                            phone={supplier.phone || ""}
                            message={`Olá, gostaria de saber mais sobre o fornecedor ${supplier.name}.`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <Package className="mx-auto mb-2 h-8 w-8" />
                      Nenhum fornecedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
