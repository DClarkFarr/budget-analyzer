import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useAccountSearchesQuery({
    accountId,
}: {
    accountId: number;
}) {
    const {
        data: searches,
        isLoading,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ["accountSearches", accountId],
        queryFn: () => AccountService.getSearches(accountId),
        retry: 0,
        staleTime: Infinity,
    });

    return {
        searches: searches || [],
        isLoading,
        isSuccess,
        refetch,
    };
}
