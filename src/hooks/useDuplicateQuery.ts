import AccountService from "@/services/AccountService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMoveTransactionMutation(accountId: number, year: number) {
    const queryClient = useQueryClient();

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
                queryKey: ["duplicate", accountId, year],
            });
            queryClient.invalidateQueries({
                queryKey: ["uncategorized", accountId, year],
            });
            queryClient.invalidateQueries({
                queryKey: ["category", "rules", categoryId],
            });
            queryClient.invalidateQueries({
                queryKey: ["category", "transactions", categoryId, year],
            });
        },
    });

    const moveTransactionToCategory = async (
        categoryId: number,
        transactionId: number
    ) => moveTransactionMutation({ categoryId, transactionId });

    return moveTransactionToCategory;
}

export function useDuplicateQuery(accountId: number, year: number) {
    const queryClient = useQueryClient();

    const {
        data: transactions,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["duplicate", accountId, year],
        queryFn: () =>
            AccountService.getDuplicateTransactions(accountId, { year }),
    });

    const revalidate = () =>
        queryClient.refetchQueries({
            queryKey: ["duplicate", accountId, year],
        });

    const moveTransactionToCategory = useMoveTransactionMutation(
        accountId,
        year
    );

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        revalidate,
        moveTransactionToCategory,
    };
}
