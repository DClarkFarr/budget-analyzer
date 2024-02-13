import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export default function useCategoriesQuery(accountId: number) {
    const {
        isLoading,
        isSuccess,
        data: categories,
    } = useQuery({
        queryKey: ["categories", accountId],
        queryFn: () => AccountService.getCategories(accountId),
    });

    return {
        isLoading,
        isSuccess,
        categories: categories || [],
    };
}
