import { QueryKeys } from "@/lib/tanstack-query/keys";
import { useQuery } from "@tanstack/react-query";
import { getMetricsByCategory, getMetricsMovements, getOverviewStock, getTopProductsInStockValue } from "./requests";


export const useOverview = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.overview, companyId],
    queryFn: async () => getOverviewStock(companyId),
  });
};


export const useGetMetricsMovements  = (companyId: string, year: number) => {
  return useQuery({
    queryKey: [QueryKeys.metricsMovements, companyId],
    queryFn: async () => getMetricsMovements(companyId, year),
  });
};

export const useGetMetricsByCategory  = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.metricsByCategory, companyId],
    queryFn: async () => getMetricsByCategory(companyId),
  });
};

export const useGetTopProductsInStockValue  = (companyId: string) => {
  return useQuery({
    queryKey: [QueryKeys.topProductsInStockValue, companyId],
    queryFn: async () => getTopProductsInStockValue(companyId),
  });
}