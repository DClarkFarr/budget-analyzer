import AccountService from "@/services/AccountService";
import { useQuery } from "@tanstack/react-query";

export function useCategoryTotals(categoryIds: number[]) {
    const {
        data: totals,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["categoryTotals", categoryIds],
        queryFn: () => AccountService.getCategoriesTotals(categoryIds),
    });

    return { totals, isLoading, isSuccess };
}
