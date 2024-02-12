import AccountService from "@/services/AccountService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

    const { mutateAsync: moveTransactionMutation } = useMutation({
        mutationFn: ({
            categoryId,
            transactionId,
        }: {
            categoryId: number;
            transactionId: number;
        }) =>
            AccountService.moveTransactionToCategory(categoryId, transactionId),
        onSuccess: (data, { categoryId }) => {
            queryClient.refetchQueries({
                queryKey: ["duplicate", accountId],
            });
            queryClient.invalidateQueries({
                queryKey: ["category", "rules", categoryId],
            });
            queryClient.invalidateQueries({
                queryKey: ["category", "transactions", categoryId],
            });
        },
    });

    const revalidate = () =>
        queryClient.refetchQueries({
            queryKey: ["duplicate", accountId],
        });

    const moveTransactionToCategory = async (
        categoryId: number,
        transactionId: number
    ) => moveTransactionMutation({ categoryId, transactionId });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate,
        moveTransactionToCategory,
    };
}
