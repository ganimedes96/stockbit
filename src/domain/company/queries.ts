import { handleServerActionResponse } from "@/api/handler";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CreateUser } from "../user/types";
import { CreateCompany } from "./actions";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (company: CreateUser) => await CreateCompany(company),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        undefined,
        router,
        "/login"
      ),
  });
};
