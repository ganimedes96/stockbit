import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, CategoryInput } from "./types";
import { QueryKeys } from "@/lib/tanstack-query/keys";
import { getCategories, getCategoryById } from "./client";
import { useRouter } from "next/navigation";
import { ResponseServerAction } from "@/api/types";
import { CreateCategory, DeleteCategory, UpdateCategory } from "./actions";
import { handleServerActionResponse } from "@/api/handler";

export const useCategoryList = (
  companyId: string,
  initialData?: Category[]
) => {
  return useQuery({
    queryKey: [QueryKeys.categories, companyId],
    queryFn: async () => getCategories(companyId),
    initialData: initialData,
  });
};

export const useGetCategoryById = (companyId: string, categoryId: string) => {
  return useQuery({
    queryKey: [QueryKeys.categories, companyId, categoryId],
    queryFn: async () => getCategoryById(companyId, categoryId),
  });
}

export const useCreateCategory = (companyId: string) => {
  const queryCategory = useQueryClient();
  const router = useRouter();
  return useMutation<ResponseServerAction, Error, CategoryInput>({
    mutationFn: async (category: CategoryInput) =>
      await CreateCategory(companyId, category),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryCategory,
        response,
        [QueryKeys.categories],
        router
      ),
  });
};

export const useUpdateCategory = (companyId: string) => {
  const queryCategory = useQueryClient();

  return useMutation<ResponseServerAction, Error, Category>({
    mutationFn: async (category: Category) =>
      await UpdateCategory(companyId, category),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryCategory, response, [
        QueryKeys.categories,
      ]),
  });
};


export const useDeleteCategory = (companyId: string, categoryId: string) => {
  const queryCategory = useQueryClient();
  return useMutation<ResponseServerAction, Error, string>({
    mutationFn: async () =>
      await DeleteCategory(companyId, categoryId),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryCategory, response, [
        QueryKeys.categories,
      ]),
  });
};
