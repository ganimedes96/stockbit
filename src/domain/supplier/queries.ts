import { QueryKeys } from "@/lib/tanstack-query/keys";
import { getSuppliers } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Supplier, SupplierInput, SupplierUpdateInput } from "./types";
import { useRouter } from "next/navigation";
import { ResponseServerAction } from "@/api/types";
import { handleServerActionResponse } from "@/api/handler";
import { CreateSupplier, UpdateSupplier, updateSupplierStatus } from "./actions";

export const useSupplierList = (
  companyId: string,
  initialData?: Supplier[]
) => {
  return useQuery({
    queryKey: [QueryKeys.suppliers, companyId],
    queryFn: async () => getSuppliers(companyId),
    initialData: initialData,
  });
};

export const useCreateSupplier = (companyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<ResponseServerAction, Error, SupplierInput>({
    mutationFn: async (supplier: SupplierInput) => {
      return await CreateSupplier(companyId, supplier);
    },
    onSuccess: async (response) => {
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.suppliers],
        router
      );
    },
  });
};


export const useUpdateSupplierStatus = ( companyId: string ) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<ResponseServerAction, Error, { supplierId: string; status: boolean }>({
    mutationFn: async ({ supplierId, status }: { supplierId: string; status: boolean }) =>
      updateSupplierStatus(companyId, supplierId, status),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.suppliers,
        QueryKeys.overview,
      ],
      router
    );
    },
  });
}


export const useUpdateSupplier = (companyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<ResponseServerAction, Error, SupplierUpdateInput>({
    mutationFn: async (supplier: SupplierUpdateInput) => {
      return await UpdateSupplier(companyId, supplier);
    },
    onSuccess: async (response) => {
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.suppliers],
        router
      );
    },
  });
};