"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ClientListMobileSkeleton, Loading } from "./loading";
import { PenBoxIcon, Plus, Search } from "lucide-react";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { ClientUpdate } from "./client-update";
import { Button } from "@/components/ui/button";
import { ClientDelete } from "./client-delete";
import { BirthdayIndicator } from "./birthday-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/get-user-initials";

import { useClientList } from "@/domain/clients/queries";
import { WhatsAppButton } from "../../debtors/components/button-whatsapp";
import { ClientForm } from "./client-form";
import { Separator } from "@/components/ui/separator";

export function ClientList({
  companyId,
  role,
}: {
  companyId: string;
  role: string;
}) {
  type BirthdayFilter = "all" | "today" | "month";
  const [searchQuery, setSearchQuery] = useState("");

  const [birthdayFilter, setBirthdayFilter] = useState<BirthdayFilter>("all");

  const { data: clients, isLoading, isFetching } = useClientList(companyId);

  function isBirthdayToday(birthday?: string | Date): boolean {
    if (!birthday) return false;
    const today = new Date();
    const birthDate =
      typeof birthday === "string" ? new Date(birthday) : birthday;
    return (
      birthDate.getDate() === today.getDate() &&
      birthDate.getMonth() === today.getMonth()
    );
  }

  function isBirthdayThisMonth(birthday?: string | Date): boolean {
    if (!birthday) return false;
    const today = new Date();
    const birthDate =
      typeof birthday === "string" ? new Date(birthday) : birthday;
    return birthDate.getMonth() === today.getMonth();
  }

  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBirthday =
      birthdayFilter === "all" ||
      (birthdayFilter === "today" && isBirthdayToday(client.birthday)) ||
      (birthdayFilter === "month" && isBirthdayThisMonth(client.birthday));

    return matchesSearch && matchesBirthday;
  });

  return (
    <>
      <div className="text-muted-foreground text-center block sm:hidden">
        <div className="flex flex-row justify-between items-center">
          <div className="max-md:hidden flex flex-col gap-1">
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              {birthdayFilter === "today"
                ? "Aniversariantes do dia"
                : "Todos os clientes"}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Input
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <ScrollArea className="w-full">
              <div className="flex gap-2 items-center justify-center mt-2">
                <Badge
                  className="py-1"
                  variant={birthdayFilter === "all" ? "default" : "outline"}
                  onClick={() => setBirthdayFilter("all")}
                >
                  Todos
                </Badge>
                <Badge
                  className="py-1"
                  onClick={() => setBirthdayFilter("today")}
                  variant={birthdayFilter === "today" ? "default" : "outline"}
                >
                  Aniversariantes hoje
                </Badge>
                <Badge
                  className="py-1"
                  onClick={() => setBirthdayFilter("month")}
                  variant={birthdayFilter === "month" ? "default" : "outline"}
                >
                  Aniversariantes do mês
                </Badge>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <ScrollArea className="h-[calc(100vh-210px)] w-full">
              <div className="flex flex-col gap-5 mt-4 pr-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <ClientListMobileSkeleton key={index} />
                  ))
                ) : filteredClients?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum cliente encontrado
                  </div>
                ) : (
                  filteredClients &&
                  (filteredClients ?? [])?.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-row gap-3 items-center justify-between"
                    >
                      <div className="flex-1 flex gap-4 items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full text-primary min-w-10 min-h-10"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getUserInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>

                        <span className="text-xs text-muted-foreground">
                          {(client.phone ?? "").replace(
                            /^(\d{2})(\d{5})(\d{4})$/,
                            "($1) $2-$3"
                          )}
                        </span>
                      </div>
                      <div>
                        {client.birthday && (
                          <BirthdayIndicator
                            date={
                              typeof client.birthday === "string"
                                ? new Date(client.birthday)
                                : client.birthday
                            }
                            name={client.name}
                          />
                        )}
                      </div>
                      <div className="flex gap-4 items-center justify-center">
                        <FormSheet
                          title="Editar cliente"
                          description="Atualize as informações do cliente."
                          formComponent={ClientUpdate}
                          formProps={{ companyId, client }}
                          customButton={
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-8 h-8"
                              title="Editar"
                            >
                              <PenBoxIcon className=" text-warning" />
                            </Button>
                          }
                        />

                        {role === "admin" && (
                          <ClientDelete client={client} companyId={companyId} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </div>

      <Card className="hidden sm:block">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Gerenciamento de clientes</CardTitle>
            <CardDescription>
              Controle de clientes e suas informações.
            </CardDescription>
          </div>
          <FormSheet
            title="Adicionar cliente"
            description="Adicione um novo cliente ao seu sistema."
            formComponent={ClientForm}
            formProps={{ companyId }}
            customButton={
              <Button
                variant="default"
                size="lg"
                className="md:max-w-40 w-full"
              >
                  <Plus size={35} />
                Adicionar          
              </Button>
            }
          />
        </CardHeader>
        <div className="flex flex-row  justify-between items-center gap-4 px-6">
          <div className=" flex flex-col  w-1/2">
            <Input
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Select
              value={birthdayFilter}
              onValueChange={(value) =>
                setBirthdayFilter(value as "all" | "today")
              }
            >
              <SelectTrigger className="w-60 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Aniversariantes hoje</SelectItem>
                <SelectItem value="month">Aniversariantes do mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className="my-6" />
        <CardContent className={isFetching ? "opacity-50" : ""}>
          <ScrollArea className="pr-4 h-[30rem]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de nascimento</TableHead>
                  <TableHead>Telefone</TableHead>

                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <Loading />
                ) : filteredClients?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients &&
                  (filteredClients ?? [])?.map((client) => (
                    <TableRow key={client.phone}>
                      <TableCell className="text-nowrap max-w-[150px] truncate">
                        {client.name}
                      </TableCell>

                      <TableCell className="max-w-[150px] truncate">
                        {client.email || "Não informado"}
                      </TableCell>
                      <TableCell>
                        {client.birthday ? (
                          <div className="flex items-center">
                            <span className="min-w-[85px] inline-block">
                              {format(client.birthday, "dd/MM/yyyy")}
                            </span>
                            <BirthdayIndicator
                              date={
                                typeof client.birthday === "string"
                                  ? new Date(client.birthday)
                                  : client.birthday
                              }
                              name={client.name}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Não informado
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{client.phone}</TableCell>

                      <TableCell className="flex items-center justify-center gap-2">
                        <FormSheet
                          title="Editar cliente"
                          description="Atualize as informações do cliente."
                          formComponent={ClientUpdate}
                          formProps={{ companyId, client }}
                          customButton={
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Editar"
                            >
                              <PenBoxIcon className="h-4 w-4 text-warning" />
                            </Button>
                          }
                        />
                        {role === "company" && (
                          <ClientDelete client={client} companyId={companyId} />
                        )}
                        <WhatsAppButton
                          phone={client.phone || "Não informado"}
                          message={`Olá, ${client.name.split(" ")[0]}!`}
                          variant="outline"
                        />

                        <ClientDelete client={client} companyId={companyId} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
