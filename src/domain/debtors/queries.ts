import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/tanstack-query/keys";
import { useRouter } from "next/navigation";
import { handleServerActionResponse } from "@/api/handler";
import { ResponseServerAction } from "@/api/types";
import {
  createDebtor,
  updateDebtStatusCashPayment,
  updateInstallmentStatus,
} from "./action";
import { DebdorsCreate, StatusDebtor } from "./types";
import { getDebtors, getDebtorsByClientId } from "./client";
import { toast } from "sonner";

export const useCreateDebtor = (companyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<ResponseServerAction, Error, DebdorsCreate>({
    mutationFn: async (debtor: DebdorsCreate) =>
      await createDebtor(companyId, debtor),

    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        [ 
          QueryKeys.debtors,
          QueryKeys.movements,
          QueryKeys.products
        ],
        router
      ),
  });
};

export const useUpdateInstallmentStatus = (companyId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseServerAction,
    Error,
    {
      debtId: string;
      installmentNumber: number;
      newStatus: StatusDebtor;
      clientId: string;
    }
  >({
    mutationFn: async ({ debtId, installmentNumber, newStatus }) => {
      return await updateInstallmentStatus(
        companyId,
        debtId,
        installmentNumber,
        newStatus
      );
    },
    onSuccess: async (response, variables) => {
      if (response.status === "success") {
        toast.success(response.message);

        await queryClient.invalidateQueries({
          queryKey: [QueryKeys.debtors, companyId],
        });

        await queryClient.invalidateQueries({
          queryKey: [QueryKeys.debtors, companyId, variables.clientId],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error("Ocorreu um erro inesperado: " + error.message);
    },
  });
};

export const useUpdateDebtStatusCashPayment = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseServerAction,
    Error,
    {
      debtId: string;
      newStatus: StatusDebtor;
      clientId: string;
    }
  >({
    mutationFn: async ({ debtId, newStatus }) => {
      // Renomeei a sua action no import para manter o padrão
      return await updateDebtStatusCashPayment(companyId, debtId, newStatus);
    },

    onSuccess: async (response, variables) => {
      if (response.status === "success") {
        toast.success(response.message);

        await queryClient.invalidateQueries({
          queryKey: [QueryKeys.debtors, companyId],
        });

        await queryClient.invalidateQueries({
          queryKey: [QueryKeys.debtors, companyId, variables.clientId],
        });
      } else {
        toast.error(response.message);
      }
    },

    onError: (error) => {
      toast.error("Ocorreu um erro inesperado: " + error.message);
    },
  });
};

export const useGetDebtors = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.debtors, companyId],
    queryFn: async () => getDebtors(companyId),
    
  });
};

export const useGetDebtorsByClientId = (
  clientId: string,
  companyId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [QueryKeys.debtors, companyId, clientId],

    queryFn: () => getDebtorsByClientId(companyId, clientId),

    enabled: !!clientId && options?.enabled,
  });
};
