"use client";

import AccountService from "@/services/AccountService";
import { Transaction } from "@/types/Account/Transaction";
import { Category, CategoryFormState } from "@/types/Statement";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useAccountQuery<WC extends boolean>(
    accountId: number,
    options: { withCategories: WC } = {
        withCategories: false as WC,
    }
) {
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
                queryFn: () =>
                    AccountService.getTransactions<WC>(accountId, options),
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

export const useDeleteCategoryMutation = (accountId: number) => {
    const queryClient = useQueryClient();
    const { mutateAsync, isSuccess } = useMutation({
        mutationKey: ["categories", accountId],
        mutationFn: async (categoryId: number) => {
            return AccountService.deleteCategory(accountId, categoryId);
        },
        onSuccess: async (data, categoryId) => {
            queryClient.setQueryData(
                ["categories", accountId],
                (oldCats: Category[]) => {
                    const categories = (oldCats || []) as Category[];
                    return categories.filter((c) => c.id !== categoryId);
                }
            );
        },
    });

    return {
        isSuccess,
        deleteCategory: (categoryId: number) => mutateAsync(categoryId),
    };
};

export const useUpdateCategoryMutation = (accountId: number) => {
    const queryClient = useQueryClient();
    const { mutateAsync, isSuccess } = useMutation({
        mutationKey: ["categories", accountId],
        mutationFn: async ({
            categoryId,
            data,
        }: {
            categoryId: number;
            data: CategoryFormState;
        }) => {
            return AccountService.updateCategory(accountId, categoryId, data);
        },
        onSuccess: async (updated, data) => {
            queryClient.setQueryData(
                ["categories", accountId],
                (oldCats: Category[]) => {
                    const categories = (oldCats || []) as Category[];
                    return categories.map((c) =>
                        c.id === data.categoryId ? updated : c
                    );
                }
            );
        },
    });

    return {
        isSuccess,
        updateCategory: (categoryId: number, data: CategoryFormState) =>
            mutateAsync({ categoryId, data }),
    };
};

export const useCreateCategoryMutation = (accountId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isSuccess, isIdle } = useMutation({
        mutationKey: ["categories", accountId],
        mutationFn: async (data: CategoryFormState) => {
            return AccountService.createCategory(accountId, data);
        },
        onSuccess: (category) => {
            queryClient.setQueryData(
                ["categories", accountId],
                (oldCats: Category[]) => {
                    const categories = (oldCats || []) as Category[];
                    categories.push(category);
                    categories.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });

                    return [...categories];
                }
            );
        },
    });

    return {
        createCategory: async (data: CategoryFormState) => mutateAsync(data),
        isCreating: !isIdle,
        isCreated: isSuccess,
    };
};
