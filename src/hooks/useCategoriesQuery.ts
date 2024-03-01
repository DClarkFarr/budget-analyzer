import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useCategoriesQuery(accountId: number, year: number) {
    const {
        isLoading,
        isSuccess,
        data: categories,
    } = useQuery({
        queryKey: ["categories", accountId, year],
        queryFn: () => AccountService.getCategories(accountId, { year }),
        refetchInterval: false,
    });

    return {
        isLoading,
        isSuccess,
        categories: categories || [],
    };
}
