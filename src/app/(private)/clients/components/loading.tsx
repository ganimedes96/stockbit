import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollBar } from "@/components/ui/scroll-area";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Loading() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Lista de clientes cadastrados</CardDescription>
        </div>
        <div>
          <Input
            type="text"
            placeholder="Pesquisar por..."
            className="pl-8 sm:w-72"
            icon={<Search className="text-muted-foreground h-4 w-4" />}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4 h-[30rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((client) => (
                <TableRow key={client}>
                  <TableCell className="w-96">
                    <Skeleton className="h-8" />
                  </TableCell>
                  <TableCell className="w-96">
                    <Skeleton className=" h-8" />
                  </TableCell>
                  <TableCell className="w-48">
                    <Skeleton className="h-8" />
                  </TableCell>
                  <TableCell className="w-64">
                    <Skeleton className=" h-8" />
                  </TableCell>
                  <TableCell className="w-48">
                    <Skeleton className=" h-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


export function ClientListMobileSkeleton() {
  return (
    <div className="flex flex-col gap-4 mt-4 pr-2">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="flex flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}