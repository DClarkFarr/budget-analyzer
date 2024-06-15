import SearchService from "@/services/SearchService";
import { SearchSerialized } from "@/types/Searches";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useSearchesQuery() {
    const {
        data: searches,
        isLoading,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ["accountSearches"],
        queryFn: () => SearchService.getSearches(),
        retry: 0,
        staleTime: Infinity,
    });

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationKey: ["accountSearches"],
        mutationFn: ({ name }: { name: string }) =>
            SearchService.createSearch(name),

        onSuccess(created) {
            queryClient.setQueryData<SearchSerialized[]>(
                ["accountSearches"],
                (old) => [...(old || []), created]
            );
        },
    });

    type SearchData = Parameters<typeof SearchService.updateSearchValues>[1];

    const updateMutation = useMutation({
        mutationKey: ["accountSearches"],
        mutationFn: ({
            searchId,
            data,
        }: {
            searchId: number;
            data: SearchData;
        }) => SearchService.updateSearchValues(searchId, data),
        onSuccess(updated) {
            queryClient.setQueryData<SearchSerialized[]>(
                ["accountSearches"],
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
