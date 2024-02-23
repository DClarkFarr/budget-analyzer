import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCategoryTotals(categoryIds: number[]) {
  const queryClient = useQueryClient();

  const {
    data: totals,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["categoryTotals", categoryIds],
    queryFn: () =>
      categoryIds.length
        ? AccountService.getCategoriesTotals(categoryIds)
        : Promise.resolve([]),
  });

  const refetch = () => {
    queryClient.refetchQueries({
      queryKey: ["categoryTotals"],
    });
  };

  return { totals, isLoading, isSuccess, refetch };
}
