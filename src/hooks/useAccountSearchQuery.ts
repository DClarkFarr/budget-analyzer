import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useAccountSearchQuery({
    accountId,
    searchId,
}: {
    accountId: number;
    searchId: number;
}) {
    const {
        data: transactions,
        isLoading,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ["accountSearch", accountId, searchId],
        queryFn: () => AccountService.querySearch(accountId, searchId),
    });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        refetch,
    };
}
