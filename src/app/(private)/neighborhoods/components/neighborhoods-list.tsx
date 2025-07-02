"use client";

import { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetNeighborhoods } from "@/domain/neighborhoods/queries";
import { Neighborhood } from "@/domain/neighborhoods/types";
import { User } from "@/domain/user/types";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/utils/text/format";
import { MapPin, Plus, Search, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "./loading";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { RegisterNeighborhood } from "./register-neighborhood";
import { NeighborhoodActiveSwitch } from "./neighborhood-active";
import { UpdateNeighborhood } from "./update-neighborhood";
// Importe seu componente de skeleton

interface NeighborhoodsListProps {
  user: User;
}

export function NeighborhoodsList({ user }: NeighborhoodsListProps) {
  // 1. Estados para o filtro
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: neighborhoods, isLoading } = useGetNeighborhoods(
    user.company.id
  );

  // 2. Lógica de filtro com useMemo
  const filteredNeighborhoods = useMemo(() => {
    if (!neighborhoods) return [];

    const search = debouncedSearchTerm.toLowerCase();

    if (!search) {
      return neighborhoods; // Retorna todos se a busca estiver vazia
    }

    return neighborhoods.filter((neighborhood) =>
      neighborhood.name.toLowerCase().includes(search)
    );
  }, [neighborhoods, debouncedSearchTerm]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle>Bairros de Entrega</CardTitle>
            <CardDescription>
              Gerencie os bairros e as taxas de entrega da sua empresa.
            </CardDescription>
          </div>

          <FormSheet
            title=" Adicionar Bairro"
            description="Adicione um novo bairro"
            formComponent={RegisterNeighborhood}
            formProps={{ companyId: user.company.id }}
            customButton={
              <Button
                variant="default"
                size="lg"
                className="md:max-w-40 w-full"
              >
                  <Plus size={35} />
                Adicionar Bairro          
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              iconPosition="left"
              placeholder="Buscar por nome do bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="border">
            <ScrollArea className="max-h-[700px] w-full">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-center">
                      Nome do Bairro
                    </TableHead>
                    <TableHead className="text-center">
                      Taxa de Entrega
                    </TableHead>
                    <TableHead className="text-center">
                      Frete Grátis Acima de
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // 3. Renderiza o skeleton enquanto os dados carregam
                    <TableSkeleton columns={5} rows={5} />
                  ) : filteredNeighborhoods.length > 0 ? (
                    // 4. Renderiza a lista de bairros filtrada
                    (filteredNeighborhoods ?? [] )?.map((neighborhood: Neighborhood) => (
                      <TableRow key={neighborhood.id}>
                        <TableCell className="font-medium text-center">
                          {neighborhood.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(neighborhood.deliveryFee)}
                        </TableCell>
                        <TableCell className="text-center ">
                          {neighborhood.minOrderValueForFreeShipping
                            ? formatCurrency(
                                neighborhood.minOrderValueForFreeShipping
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              neighborhood.isActive ? "success" : "secondary"
                            }
                          >
                            {neighborhood.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <NeighborhoodActiveSwitch
                              companyId={user.company.id}
                              neighborhood={neighborhood}
                            />
                            <FormSheet
                              title=" Editar Bairro"
                              description="Edite o bairro"
                              formComponent={UpdateNeighborhood}
                              formProps={{
                                user,
                                neighborhood
                              }}
                              customButton={
                                <Button size={"icon"} variant="outline">
                                  <SquarePen />
                                </Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Renderiza a mensagem de "nenhum item"
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-48 text-center text-muted-foreground"
                      >
                        <MapPin className="mx-auto mb-2 h-8 w-8" />
                        Nenhum bairro cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
