import AccountService from "@/services/AccountService";
import { Transaction } from "@/types/Account/Transaction";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useAccountQuery(accountId: number) {
  const [
    { data: account, isLoading: accountLoading, isError: accountError },
    {
      data: transactions,
      isLoading: transactionsLoading,
      isError: transactionsError,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: ["account", accountId],
        queryFn: () => AccountService.get(accountId),
        staleTime: Infinity,
      },
      {
        queryKey: ["transactions", accountId],
        queryFn: () => AccountService.getTransactions(accountId),
        staleTime: Infinity,
      },
    ],
  });

  const isLoading = useMemo(() => {
    return accountLoading;
  }, [accountLoading]);

  return {
    isLoading,
    account,
    accountLoading,
    accountError,
    transactions: transactions || ([] as Transaction[]),
    transactionsLoading,
    transactionsError,
  };
}
