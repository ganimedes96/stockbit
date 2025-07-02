import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/tanstack-query/keys";
import { ResponseServerAction } from "@/api/types";
import { handleServerActionResponse } from "@/api/handler";
import { Product, ProductInput, ProductUpdateInput } from "./types";
import { getProductById, getProducts } from "./client";
import {
  CreateProduct,
  DeleteProduct,
  UpdateFavoriteProduct,
  UpdateProduct,
  UpdateSatusProduct,
} from "./actions";
import { getProductsServer } from "./server";

export const useProductList = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.products, companyId],
    queryFn: async () => getProducts(companyId),
  });
};

export const useGetProductById = (companyId: string, productId: string) => {
  return useQuery({
    queryKey: [QueryKeys.products, companyId, productId],
    queryFn: async () => getProductById(companyId, productId),
  });
};

export const useCreateProduct = (companyId: string) => {
  const queryProduct = useQueryClient();
  return useMutation<ResponseServerAction, Error, ProductInput>({
    mutationFn: async (product: ProductInput) =>
      await CreateProduct(companyId, product),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryProduct, response, [
        QueryKeys.products, QueryKeys.movements
      ]),
  });
};

export const useUpdateProduct = (companyId: string) => {
  const queryProduct = useQueryClient();

  return useMutation<ResponseServerAction, Error, Product>({
    mutationFn: async (product: ProductUpdateInput) =>
      await UpdateProduct(companyId, product),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryProduct, response, [
        QueryKeys.products,
      ]),
  });
};

export const useDeleteProduct = (companyId: string, productId: string) => {
  const queryProduct = useQueryClient();
  return useMutation({
    mutationFn: async () => await DeleteProduct(companyId, productId),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryProduct, response, [
        QueryKeys.products,
      ]),
  });
};

export const useUpdateStatusProduct = (
  companyId: string,
) => {
  const queryProduct = useQueryClient();
  return useMutation<ResponseServerAction, Error, { status: boolean; productId: string }>({
    mutationFn: async ({status, productId}: {status: boolean, productId: string}) =>
      await UpdateSatusProduct(companyId, productId, status),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryProduct, response, [
        QueryKeys.products,
      ]),
  });
};

export const useGetProductsServer = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.products, companyId],
    queryFn: async () => getProductsServer(companyId),
  });
};


export const useUpdateFavoriteProduct = (
  companyId: string,
) => {
  const queryProduct = useQueryClient();
  return useMutation<ResponseServerAction, Error, { productId: string; isFavorite: boolean }>({
    mutationFn: async ({ productId, isFavorite }) =>
      await UpdateFavoriteProduct(companyId, productId, isFavorite),
    onSuccess: async (response) =>
      await handleServerActionResponse(queryProduct, response, [
        QueryKeys.products,
      ]),
  });
}