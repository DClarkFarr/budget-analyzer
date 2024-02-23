import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useAccountStatsQuery(userId?: number) {
  const queryClient = useQueryClient();

  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["accounts", "stats", userId],
    queryFn: AccountService.accountsStats,
    retry: 1,
  });

  const revalidate = () => {
    queryClient.refetchQueries({
      queryKey: ["accounts", "stats", userId],
    });
  };

  return {
    isLoading,
    isError,
    isSuccess,
    stats: data || {},
    error,
    revalidate,
  };
}
