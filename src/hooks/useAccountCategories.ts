import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useAccountCategories(accountId: number, year: number) {
    const {
        data: categories,
        isLoading,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ["categories", accountId, year],
        queryFn: () => AccountService.getCategories(accountId, { year }),
        staleTime: Infinity,
    });

    return {
        categories: categories || [],
        isLoading,
        isSuccess,
        refetch,
    };
}
