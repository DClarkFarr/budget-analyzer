import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useCategoryTransactions(categoryId: number) {
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
    };
}
