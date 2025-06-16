import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MovimentsInput } from "./types";
import { ResponseServerAction } from "@/api/types";
import { createMovement } from "./action";
import { handleServerActionResponse } from "@/api/handler";
import { QueryKeys } from "@/lib/tanstack-query/keys";
import { getMovements, getMovementsByDate } from "./client";
import { useRouter } from "next/navigation";

export const useCreateMovement = (companyId: string) => {
  const route = useRouter();
  const queryMoviment = useQueryClient();
  return useMutation<ResponseServerAction, Error, MovimentsInput>({
    mutationFn: async (moviment: MovimentsInput) =>
      await createMovement(companyId, moviment),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryMoviment,
        response,
        [QueryKeys.movements],
        route
      ),
  });
};

export const useMovementList = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.movements, companyId],
    queryFn: async () => getMovements(companyId),
  });
};


export const useMovementsFilter = (companyId: string, filter: "day" | "month") => {
  return useQuery({
    queryKey: [QueryKeys.movements, companyId, filter],
    queryFn: async () => getMovementsByDate(companyId, filter),
  });
};