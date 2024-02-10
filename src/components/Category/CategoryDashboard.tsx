"use client";

import useCategoryTransactions from "@/hooks/useCategoryTransactions";
import { Account } from "@/types/Account";
import { Category, CategoryRuleFormState } from "@/types/Statement";
import RuleForm from "./RuleForm";
import { Transaction } from "@/types/Account/Transaction";
import AccountService from "@/services/AccountService";
import useCategoryRules from "@/hooks/useCategoryRules";

export default function CategoryDashboard({
    category,
    account,
    accountTransactions,
}: {
    category: Category;
    account: Account;
    accountTransactions: Transaction[];
}) {
    const { transactions, isLoading, revalidate } = useCategoryTransactions(
        category.id
    );

    const {
        categoryRules,
        isLoading: isLoadingRules,
        createRule,
    } = useCategoryRules(category.id);

    const onCreateRule = async (
        data: CategoryRuleFormState,
        { reset }: { reset: () => void }
    ) => {
        await createRule(data);
        reset();
        revalidate();
    };

    const onUpdateRule =
        (ruleId: number) => async (data: CategoryRuleFormState) => {
            console.log("you submitted", ruleId, "and", data);
        };

    return (
        <div className="category-dashboard">
            <div className="mb-4">
                Category is matching {transactions.length} of{" "}
                {accountTransactions.length} transactions.
            </div>
            <div className="rules flex flex-col gap-y-3 mb-4">
                {isLoadingRules && (
                    <div className="loading">Loading Rules...</div>
                )}
                {categoryRules.length > 0 &&
                    categoryRules.map((rule) => (
                        <div className="rule bg-slate-100 p-4" key={rule.id}>
                            <h4>
                                Edit Rule: <b>{rule.name}</b>
                            </h4>
                            <RuleForm
                                transactions={accountTransactions}
                                rule={rule}
                                onSubmit={onUpdateRule(rule.id)}
                                buttons={({ busy, disabled }) => (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            disabled={disabled}
                                        >
                                            {busy ? "Updating" : "Update"}
                                        </button>
                                    </>
                                )}
                            />
                        </div>
                    ))}
                <div className="bg-sky-100 p-4">
                    <h4 className="font-semibold">Create New Rule</h4>
                    <RuleForm
                        transactions={accountTransactions}
                        onSubmit={onCreateRule}
                        buttons={({ busy, disabled }) => (
                            <>
                                <button
                                    className="btn btn-primary"
                                    disabled={disabled}
                                >
                                    {busy ? "Creating" : "Create"}
                                </button>
                            </>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
