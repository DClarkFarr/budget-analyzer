import AccountService from "@/services/AccountService";
import { Transaction } from "@/types/Account/Transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMoveTransactionMutation(accountId: number, year: number) {
    const queryClient = useQueryClient();

    const { mutateAsync: moveTransactionMutation } = useMutation({
        mutationKey: ["uncategorized", accountId, year],
        mutationFn: ({
            categoryId,
            transactionId,
        }: {
            categoryId: number;
            transactionId: number;
        }) =>
            AccountService.moveTransactionToCategory(categoryId, transactionId),
        onMutate: ({ transactionId }) => {
            const transactions = [
                ...(queryClient.getQueryData<Transaction[]>([
                    "uncategorized",
                    accountId,
                    year,
                ]) || []),
            ];
            const index = transactions.findIndex((t) => t.id === transactionId);
            const transaction = transactions[index];

            transactions.splice(index, 1);

            queryClient.setQueryData(
                ["uncategorized", accountId, year],
                transactions
            );

            return { transaction, index };
        },
        onError: (error, variables, context) => {
            if (context?.index && context?.transaction) {
                queryClient.setQueryData(
                    ["uncategorized", accountId, year],
                    (old: Transaction[]) => {
                        if (old) {
                            const ts = [...old];
                            ts.splice(context.index, 0, context.transaction);
                            return ts;
                        }
                        return old;
                    }
                );
            }
        },
        onSuccess: (data, { categoryId }) => {
            queryClient.refetchQueries({
                queryKey: ["duplicate", accountId, year],
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
