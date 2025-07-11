import { QueryKeys } from "@/lib/tanstack-query/keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDailyCashSessions, getOpenCashSession } from "./client";
import { handleServerActionResponse } from "@/api/handler";
import {
  closeCashRegister,
  ClosingInput,
  openCashSession,
  reopenCashSession,
} from "./action";

export const useGetLatestCashSessionOnClient = (
  companyId: string,
  date?: Date
) => {
  return useQuery({
    queryKey: [QueryKeys.cashClosings, companyId, date?.toISOString()],
    queryFn: () => getDailyCashSessions(companyId, date ?? new Date()),
  });
};

export const useGetOpenCashSession = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.cashClosings, companyId],
    queryFn: () => getOpenCashSession(companyId),
  });
};

export const useCloseCashRegister = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      closingInput,
      sessionId,
    }: {
      closingInput: ClosingInput;
      sessionId: string;
    }) => closeCashRegister(companyId, sessionId, closingInput),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.cashClosings,
        QueryKeys.overview,
      ]);
    },
  });
};

export const useOpenCashSession = (companyId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      operationId,
      openingBalance,
    }: {
      operationId: string;
      openingBalance: number;
    }) => openCashSession(companyId, operationId, openingBalance),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.cashClosings,
        QueryKeys.overview,
      ]);
    },
  });
};

export const useReopenCashSession = (companyId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) =>
      reopenCashSession(companyId, sessionId),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.cashClosings,
        QueryKeys.overview,
      ]);
    },
  });
};
