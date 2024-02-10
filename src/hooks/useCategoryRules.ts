import AccountService from "@/services/AccountService";
import { CategoryRuleFormState } from "@/types/Statement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCategoryRules(categoryId: number) {
    const queryClient = useQueryClient();

    const {
        data: categoryRules,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey: ["category", "rules", categoryId],
        queryFn: async () =>
            (await AccountService.getCategoryRules(categoryId)) || [],
    });

    const { mutateAsync: createRuleMutation } = useMutation({
        mutationFn: (data: CategoryRuleFormState) =>
            AccountService.createCategoryRule(categoryId, data),
        onSuccess: (created) => {
            queryClient.setQueryData(
                ["category", "rules", categoryId],
                (old: any) => {
                    return [...(old || []), created].sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                }
            );
        },
    });

    const createRule = async (data: CategoryRuleFormState) =>
        createRuleMutation(data);

    return {
        categoryRules: categoryRules || [],
        createRule,
        isLoading,
        isSuccess,
        revalidate: () =>
            queryClient.refetchQueries({
                queryKey: ["category", "rules", categoryId],
                exact: true,
            }),
    };
}
