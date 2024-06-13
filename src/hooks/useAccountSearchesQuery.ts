import AccountService from "@/services/AccountService";
import { AccountSearchSerialized } from "@/types/Account/Searches";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationKey: ["accountSearches", accountId],
        mutationFn: ({ name }: { name: string }) =>
            AccountService.createSearch(accountId, name),

        onSuccess(created) {
            queryClient.setQueryData<AccountSearchSerialized[]>(
                ["accountSearches", accountId],
                (old) => [...(old || []), created]
            );
        },
    });

    type SearchData = Parameters<typeof AccountService.updateSearchValues>[2];

    const updateMutation = useMutation({
        mutationKey: ["accountSearches", accountId],
        mutationFn: ({
            searchId,
            data,
        }: {
            searchId: number;
            data: SearchData;
        }) => AccountService.updateSearchValues(accountId, searchId, data),
        onSuccess(updated) {
            queryClient.setQueryData<AccountSearchSerialized[]>(
                ["accountSearches", accountId],
                (old) =>
                    (old || []).map((search) =>
                        search.id === updated.id ? updated : search
                    )
            );
        },
    });

    const createSearch = async (name: string) =>
        createMutation.mutateAsync({ name });

    const updateSearch = async (searchId: number, data: SearchData) =>
        updateMutation.mutateAsync({ searchId, data });

    return {
        searches: searches || [],
        isLoading,
        isSuccess,
        createSearch,
        updateSearch,
        refetch,
    };
}
