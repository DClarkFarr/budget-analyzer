import AccountService from "@/services/AccountService";
import { CategoryRule, CategoryRuleFormState } from "@/types/Statement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCategoryRules(categoryId: number) {
    const queryClient = useQueryClient();

    const queryKey = ["category", "rules", categoryId];

    const {
        data: categoryRules,
        isLoading,
        isSuccess,
    } = useQuery({
        queryKey,
        queryFn: async () =>
            (await AccountService.getCategoryRules(categoryId)) || [],
    });

    const { mutateAsync: createRuleMutation } = useMutation({
        mutationFn: (data: CategoryRuleFormState) =>
            AccountService.createCategoryRule(categoryId, data),
        onSuccess: (created) => {
            queryClient.setQueryData(queryKey, (old: any) => {
                return [...(old || []), created].sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
            });
        },
    });

    const { mutateAsync: updateRuleMutation } = useMutation({
        mutationFn: (props: { id: number; data: CategoryRuleFormState }) =>
            AccountService.updateCategoryRule(categoryId, props.id, props.data),
        onSuccess: (updated) => {
            queryClient.setQueryData(queryKey, (old: any) => {
                const rules = [...(old || [])].map((r) =>
                    r.id === updated.id ? updated : r
                );

                return rules.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
            });
        },
    });

    const { mutateAsync: deleteRuleMutation } = useMutation({
        mutationFn: (ruleId: number) =>
            AccountService.deleteCategoryRule(categoryId, ruleId),
        onSuccess: (res, ruleId) => {
            queryClient.setQueryData(queryKey, (old: any) => {
                return (old || []).filter((r: CategoryRule) => r.id !== ruleId);
            });
        },
    });

    const createRule = async (data: CategoryRuleFormState) =>
        createRuleMutation(data);

    const updateRule = (ruleId: number, data: CategoryRuleFormState) =>
        updateRuleMutation({ id: ruleId, data });

    const deleteRule = (ruleId: number) => deleteRuleMutation(ruleId);

    return {
        categoryRules: categoryRules || [],
        isLoading,
        isSuccess,
        createRule,
        updateRule,
        deleteRule,
        revalidate: () =>
            queryClient.refetchQueries({
                queryKey,
                exact: true,
            }),
    };
}
