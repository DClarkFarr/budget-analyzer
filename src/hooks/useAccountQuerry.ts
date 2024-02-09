import AccountService from "@/services/AccountService";
import { Transaction } from "@/types/Account/Transaction";
import { Category, CategoryFormState } from "@/types/Statement";
import { QueryClient, useMutation, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useAccountQuery(accountId: number) {
  const [
    { data: account, isLoading: accountLoading, isError: accountError },
    {
      data: transactions,
      isLoading: transactionsLoading,
      isError: transactionsError,
    },
    {
      data: categories,
      isLoading: categoriesLoading,
      isError: categoriesError,
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
      {
        queryKey: ["categories", accountId],
        queryFn: () => AccountService.getCategories(accountId),
        staleTime: Infinity,
      },
    ],
  });

  const isLoading = useMemo(() => {
    return accountLoading || transactionsLoading || categoriesLoading;
  }, [accountLoading, transactionsLoading, categoriesLoading]);

  return {
    isLoading,
    account,
    accountLoading,
    accountError,
    transactions: transactions || [],
    transactionsLoading,
    transactionsError,
    categories: categories || [],
    categoriesLoading,
    categoriesError,
  };
}

export const useCreateCategoryMutation = (accountId: number) => {
  const queryClient = new QueryClient();

  const { mutateAsync, isSuccess, isIdle } = useMutation({
    mutationKey: ["categories", accountId],
    mutationFn: async (data: CategoryFormState) => {
      return AccountService.createCategory(accountId, data);
    },
    onSuccess: (category) => {
      queryClient.setQueryData(["categories", accountId], (oldCats) => {
        const categories = (oldCats || []) as Category[];
        categories.push(category);
        categories.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      });
    },
  });

  return {
    createCategory: mutateAsync,
    isCreating: !isIdle,
    isCreated: isSuccess,
  };
};
