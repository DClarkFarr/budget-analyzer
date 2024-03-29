import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useAccountsQuery(userId?: number) {
  const queryClient = useQueryClient();

  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: AccountService.list,
    retry: 1,
  });

  const revalidate = () => {
    queryClient.refetchQueries({
      queryKey: ["accounts", userId],
    });
  };

  return {
    isLoading,
    isError,
    isSuccess,
    accounts: data || [],
    error,
    revalidate,
  };
}
