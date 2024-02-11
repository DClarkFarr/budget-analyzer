import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUncategorizedQuery(accountId: number) {
    const queryClient = useQueryClient();

    const {
        data: transactions,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["uncategorized", accountId],
        queryFn: () => AccountService.getUncategorizedTransactions(accountId),
    });

    const revalidate = () =>
        queryClient.refetchQueries({
            queryKey: ["uncategorized", accountId],
        });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate,
    };
}
