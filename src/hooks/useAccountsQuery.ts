import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useAccountsQuery(userId?: number) {
  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: AccountService.list,
  });

  return { isLoading, isError, isSuccess, accounts: data || [], error };
}
