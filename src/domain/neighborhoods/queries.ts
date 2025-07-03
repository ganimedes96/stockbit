import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/tanstack-query/keys";
import { useRouter } from "next/navigation";
import { handleServerActionResponse } from "@/api/handler";
import { getNeighborhoodById, getNeighborhoods } from "./client";
import { createNeighborhood, updateNeighborhood, updateNeighborhoodStatus } from "./action";
import { NeighborhoodInput, NeighborhoodUpdate } from "./types";

export const useGetNeighborhoods = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.neighborhoods, companyId],
    queryFn: async () => {
      const neighborhoods = await getNeighborhoods(companyId);
      return neighborhoods;
    },
  });
};

export const useCreateNeighborhood = (companyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (neighborhood: NeighborhoodInput) =>
      createNeighborhood(companyId, neighborhood),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.neighborhoods,
        QueryKeys.overview,
      ],
      router
    );
    },
  });
};

export const useUpdateNeighborhood = (companyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (neighborhood: NeighborhoodUpdate) =>
      updateNeighborhood(companyId, neighborhood),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.neighborhoods,
        QueryKeys.overview,
      ],
      router
    );
    },
  });
};


export const useUpdateNeighborhoodStatus = ( companyId: string ) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ neighborhoodId, status }: { neighborhoodId: string; status: boolean }) =>
      updateNeighborhoodStatus(companyId, neighborhoodId, status),
    onSuccess: async (response) => {
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.neighborhoods,
        QueryKeys.overview,
      ],
      router
    );
    },
  });
}


interface NeighborhoodQueryOptions {
  enabled?: boolean;
}

export const useGetNeighborhoodById = (
  companyId: string,
  neighborhoodId: string,
  // 1. Adicionamos um terceiro parâmetro opcional para as opções
  options?: NeighborhoodQueryOptions
) => {
  return useQuery({
    queryKey: [QueryKeys.neighborhoods, companyId, neighborhoodId],
    queryFn: async () => {
      // A queryFn só será executada se 'enabled' for true.
      // Adicionamos uma verificação para não buscar com um ID vazio.
      if (!neighborhoodId) return null;
      
      const neighborhood = await getNeighborhoodById(companyId, neighborhoodId);
      return neighborhood;
    },
    // 2. A opção 'enabled' recebida é passada diretamente para o useQuery.
    // Se a opção não for passada, o 'enabled' será 'undefined', e a query rodará por padrão.
    enabled: options?.enabled,
  });
};