import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, CreateClient, UpdateClient } from "./types";
import { getClientById, getClients } from "./client";
import { QueryKeys } from "@/lib/tanstack-query/keys";
import { useRouter } from "next/navigation";
import { createClient, updateClient, deleteClient } from "./actions";
import { handleServerActionResponse } from "@/api/handler";
import { ResponseServerAction } from "@/api/types";

export const useClientList = (companyId: string, initialData?: Client[]) => {
  return useQuery({
    queryKey: [QueryKeys.clients, companyId],
    queryFn: async () => getClients(companyId),
    initialData: initialData,
  });
};

export const useClient = (companyId: string, clientId: string) => {
  return useQuery({
    queryKey: [QueryKeys.clients, companyId, clientId],
    queryFn: async () => getClientById(companyId, clientId),
  });
};

export const useCreateClient = (companyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<ResponseServerAction, Error, CreateClient>({
    mutationFn: async (client: CreateClient) =>
      await createClient(companyId, client),

    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.clients, QueryKeys.overview],
        router
      ),
  });
};

export const useUpdateClient = (companyId: string, clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: UpdateClient) =>
      updateClient(companyId, clientId, client),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.clients,
        QueryKeys.overview,
      ]),
  });
};

export const useDeleteClient = (companyId: string, clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => deleteClient(companyId, clientId),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryClient, response, [
        QueryKeys.clients,
        QueryKeys.overview,
      ]),
  });
};
