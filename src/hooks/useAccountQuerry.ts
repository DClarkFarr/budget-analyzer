import AccountService from "@/services/AccountService";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useAccountQuery(accountId: number) {
  const [
    { data: accountData, isLoading: accountLoading, isError: accountError },
  ] = useQueries({
    queries: [
      {
        queryKey: ["account", accountId],
        queryFn: () => AccountService.get(accountId),
        staleTime: Infinity,
      },
    ],
  });

  const isLoading = useMemo(() => {
    return accountLoading;
  }, [accountLoading]);

  return {
    isLoading,
    accountData,
    accountLoading,
    accountError,
  };
}
