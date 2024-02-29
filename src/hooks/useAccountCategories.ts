import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useAccountCategories(accountId: number) {
    const {
        data: categories,
        isLoading,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ["categories", accountId],
        queryFn: () => AccountService.getCategories(accountId),
        staleTime: Infinity,
    });

    return {
        categories: categories || [],
        isLoading,
        isSuccess,
        refetch,
    };
}
