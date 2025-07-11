"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarX, FileText, Loader2, Printer, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import {
  useGetDailyPdvOrders,
  useGetDailySummaryOnClient,
} from "@/domain/orders/queries";
import { DetailedReportModal } from "./detailed-report-modal";
import { User } from "@/domain/user/types";
import { OverviewDebtors } from "./overview-summary-cards";
import { DatePicker } from "@/components/ui/date-picker";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { formatCurrency } from "@/utils/text/format";
import { Separator } from "@/components/ui/separator";
import {
  useCloseCashRegister,
  useGetLatestCashSessionOnClient,
  useReopenCashSession,
} from "@/domain/cash-closing/queries";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CashSessionStatus } from "@/domain/cash-closing/types";
import { isToday } from "./helpers";
import { ReopenCashModal } from "./reopen-cash-modal";

const schemaCashClosing = z.object({
  countedCashAmount: z.coerce.number().min(0, "O valor é obrigatório."),
  notes: z.string().optional(),
  operetorId: z.string().optional(),
});

interface CashClosingDetailsProps {
  user: User;
}
type CashClosing = z.infer<typeof schemaCashClosing>;

export function CashClosingDetails({ user }: CashClosingDetailsProps) {
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const { data: openSession } = useGetLatestCashSessionOnClient(
    user.company.id,
    selectedDate
  );

  const { mutate: closeRegister, isPending } = useCloseCashRegister(
    user.company.id
  );

  const { mutate: reopenCashSession, isPending: isReopening } =
    useReopenCashSession(user.company.id);

  const { control, watch, handleSubmit, trigger } = useForm<CashClosing>({
    resolver: zodResolver(schemaCashClosing),
    mode: "onBlur",
    defaultValues: { notes: "", countedCashAmount: 0 },
  });

  const countedCashAmount = watch("countedCashAmount");

  const { data: orders, isLoading: isLoadingOrders } = useGetDailyPdvOrders(
    user.company.id,
    selectedDate || new Date()
  );
  const { data: summary, isLoading: isLoadingSummary } =
    useGetDailySummaryOnClient(user.company.id, selectedDate || new Date());

  const isLoading = isLoadingSummary || isLoadingOrders;

  const cashSummary = useMemo(() => {
    const openingBalance = openSession?.openingBalance ?? 0;
    const cashSales = summary?.salesByPaymentMethod.cash.total ?? 0;
    const expectedCashAmount = openingBalance + cashSales;
    const difference = countedCashAmount - expectedCashAmount;
    return { openingBalance, expectedCashAmount, difference };
  }, [summary, countedCashAmount, openSession]);

  const handleInitiateClosing = async () => {
    if (!openSession) {
      toast.error("Nenhum caixa aberto encontrado para fechar.");
      return;
    }
    const isValid = await trigger(); // Valida o formulário
    if (isValid) {
      setIsConfirming(true); // Se for válido, abre o modal
    }
  };

  const processClosing = (data: CashClosing) => {
    if (!openSession) {
      toast.error("Não foi possível encontrar os dados de abertura do caixa.");
      return;
    }

    const closingInput = {
      countedCashAmount: data.countedCashAmount,
      notes: data.notes,
    };

    // 3. Passa o ID da sessão aberta para a mutação.
    closeRegister(
      {
        sessionId: openSession?.id || "",
        closingInput,
      },
      {
        onSuccess: (response) => {
          if (response.status === "success") {
            localStorage.removeItem("cashDrawerStatus"); // Limpa o localStorage
            setIsConfirming(false);
            toast.success("Caixa fechado com sucesso!");
          }
        },
        onError: () => setIsConfirming(false),
      }
    );
  };

  const handleConfirmClick = () => {
    handleSubmit(processClosing)();
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
              <div>
                <DatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  label="Data do Relatório"
                />
              </div>
              <div>
                <ControlledSelect
                  control={control}
                  name="operetorId"
                  label="Operador"
                  placeholder="Todos"
                  options={[{ id: "1", name: "Admin" }]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => setShowDetailedReport(true)}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório Detalhado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full flex flex-col gap-6">
          {/* Passamos o summary e o isLoading para o componente de cards */}
          <OverviewDebtors
            summary={summary}
            isLoadingSummary={isLoading}
            openSession={openSession || undefined}
          />
        </div>
        {openSession &&
          (openSession.status === CashSessionStatus.OPEN ||
            openSession.status === CashSessionStatus.REOPENED) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Fechamento de Caixa</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit(processClosing)}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ControlledInput
                        control={control}
                        name="countedCashAmount"
                        label="Dinheiro no Caixa *"
                        type="number"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <ControlledInput
                        control={control}
                        name="notes"
                        label="Observação"
                        placeholder="Observação"
                        type="text"
                      />
                    </div>
                  </div>

                  {countedCashAmount > 0 && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Conferência de Caixa</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Saldo Inicial (Suprimento):</span>
                          <span>
                            {formatCurrency(cashSummary.openingBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vendas em Dinheiro:</span>
                          <span>
                            {formatCurrency(
                              summary?.salesByPaymentMethod.cash.total ?? 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total Esperado:</span>
                          <span>
                            {formatCurrency(cashSummary.expectedCashAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Contado:</span>
                          <span>{formatCurrency(countedCashAmount)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Diferença:</span>
                          <span
                            className={
                              cashSummary.difference >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {formatCurrency(cashSummary.difference)}
                            {cashSummary.difference > 0
                              ? " (Sobra)"
                              : cashSummary.difference < 0
                              ? " (Falta)"
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir Relatório
                    </Button>
                    <Button
                      type="button"
                      onClick={handleInitiateClosing}
                      className="flex-1"
                      disabled={isPending}
                    >
                      Fechar Caixa
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}

        {openSession &&
          openSession.status === CashSessionStatus.FINALIZED &&
          isToday(openSession.startingOpen) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-500">
                  <CalendarX className="w-5 h-5" />
                  Caixa Fechado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  O caixa do dia já foi fechado. Caso precise registrar novas
                  vendas, você pode reabrir o caixa para continuar operando
                  hoje.
                </p>

                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowReopenModal(true)}
                    disabled={isReopening}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reabrir Caixa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* 3. O modal só é renderizado se for aberto e os dados existirem. */}
      {showDetailedReport && (
        <DetailedReportModal
          open={showDetailedReport}
          onClose={() => setShowDetailedReport(false)}
          orders={orders || []} // Passa um array vazio como fallback seguro
          summary={summary}
          user={user}
          date={selectedDate ?? new Date()}
        />
      )}

      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Fechamento de Caixa?</AlertDialogTitle>
            <AlertDialogDescription>
              Revise os valores antes de confirmar. Esta ação registrará o
              fechamento do dia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2 text-sm border-t border-b py-4">
            <div className="flex justify-between">
              <span>Total Esperado em Dinheiro:</span>
              <span className="font-bold">
                {formatCurrency(cashSummary.expectedCashAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Contado:</span>
              <span className="font-bold">
                {formatCurrency(countedCashAmount ?? 0)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Diferença:</span>
              <span
                className={
                  cashSummary.difference >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {formatCurrency(cashSummary.difference)}
              </span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
            {/* Este botão agora chama o handleSubmit, que executa a lógica final */}
            <AlertDialogAction
              type="submit"
              onClick={handleConfirmClick}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Finalizando...
                </>
              ) : (
                "Sim, fechar caixa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReopenCashModal
        open={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        isPending={isReopening}
        onConfirm={() => {
          if (!openSession) return;
          reopenCashSession(
            { sessionId: openSession.id || "" },
            {
              onSuccess: () => {
                setShowReopenModal(false);
              },
              onError: () => setShowReopenModal(false),
            }
          );
        }}
      />
    </>
  );
}
