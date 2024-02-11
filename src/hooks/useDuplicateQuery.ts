import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useDuplicateQuery(accountId: number) {
    const queryClient = useQueryClient();

    const {
        data: transactions,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["duplicate", accountId],
        queryFn: () => AccountService.getDuplicateTransactions(accountId),
    });

    const revalidate = () =>
        queryClient.refetchQueries({
            queryKey: ["duplicate", accountId],
        });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate,
    };
}
