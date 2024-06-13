import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useCategoriesQuery(
    accountId: number,
    year: number | null
) {
    const {
        isLoading,
        isSuccess,
        data: categories,
    } = useQuery({
        queryKey: ["categories", accountId, year],
        queryFn: () =>
            AccountService.getCategories(accountId, {
                year: year || undefined,
            }),
        refetchInterval: false,
    });

    return {
        isLoading,
        isSuccess,
        categories: categories || [],
    };
}
