import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCategoryTransactions(categoryId: number) {
    const queryClient = useQueryClient();

    const {
        data: transactions,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["category", "transactions", categoryId],
        queryFn: () => AccountService.getCategoryTransactions(categoryId),
    });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate: () =>
            queryClient.refetchQueries({
                queryKey: ["category", "transactions", categoryId],
                exact: true,
            }),
    };
}
