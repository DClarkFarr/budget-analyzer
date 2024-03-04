import AccountService from "@/services/AccountService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCategoryTransactions(
    categoryId: number,
    year: number
) {
    const queryClient = useQueryClient();

    const {
        data: transactions,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["category", "transactions", categoryId, year],
        queryFn: () =>
            AccountService.getCategoryTransactions(categoryId, { year }),
    });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate: () =>
            queryClient.refetchQueries({
                queryKey: ["category", "transactions", categoryId, year],
                exact: true,
            }),
    };
}
