import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUncategorizedQuery(accountId: number, year: number) {
    const queryClient = useQueryClient();

    const {
        data: transactions,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["uncategorized", accountId, year],
        queryFn: () =>
            AccountService.getUncategorizedTransactions(accountId, { year }),
    });

    const revalidate = () =>
        queryClient.refetchQueries({
            queryKey: ["uncategorized", accountId, year],
        });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate,
    };
}
