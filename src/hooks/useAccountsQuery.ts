import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useAccountsQuery(userId?: number) {
  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: AccountService.list,
    retry: 1,
  });

  return { isLoading, isError, isSuccess, accounts: data || [], error };
}
