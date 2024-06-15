import SearchService from "@/services/SearchService";
import { useQuery } from "@tanstack/react-query";

export default function useSearchQuery({ searchId }: { searchId: number }) {
    const {
        data: transactions,
        isLoading,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ["accountSearch", searchId],
        queryFn: () => SearchService.querySearch(searchId),
    });

    return {
        transactions: transactions || [],
        isLoading,
        isSuccess,
        refetch,
    };
}
