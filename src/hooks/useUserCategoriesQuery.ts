import SearchService from "@/services/SearchService";
import { useQuery } from "@tanstack/react-query";

export default function useUserCategoriesQuery() {
    const {
        isLoading,
        isSuccess,
        data: categories,
    } = useQuery({
        queryKey: ["user-categories"],
        queryFn: () => SearchService.getCategories(),
        refetchInterval: false,
    });

    return {
        isLoading,
        isSuccess,
        categories: categories || [],
    };
}
