"use client";

import useCategoryTransactions from "@/hooks/useCategoryTransactions";
import { Account } from "@/types/Account";
import { Category, CategoryRuleFormState } from "@/types/Statement";
import RuleForm from "./RuleForm";
import { Transaction } from "@/types/Account/Transaction";
import useCategoryRules from "@/hooks/useCategoryRules";
import { useMemo, useState } from "react";
import TransactionsTableReadonly from "./TransactionsTableReadonly";
import { formatCurrency } from "@/methods/currency";
import { useAccountContext } from "../Providers/AccountProvider";

export default function CategoryDashboard({
    category,
    account,
    accountTransactions,
    search,
    onChange,
}: {
    category: Category;
    account: Account;
    accountTransactions: Transaction[];
    search?: string;
    onChange?: () => Promise<void>;
}) {
    const { currentYear } = useAccountContext();

    const {
        transactions,
        isLoading,
        revalidate: revalidateTransactions,
    } = useCategoryTransactions(category.id, currentYear);

    const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

    const transactionIds = useMemo(() => {
        return transactions.map((t) => t.id);
    }, [transactions]);

    const totals = useMemo(() => {
        return transactions.reduce(
            (acc, t) => {
                acc[t.expenseType] += t.amount;
                acc.net += t.expenseType === "incoming" ? t.amount : -t.amount;
                return acc;
            },
            { incoming: 0, outgoing: 0, net: 0 }
        );
    }, [transactions]);

    const {
        categoryRules,
        isLoading: isLoadingRules,
        createRule,
        updateRule,
        deleteRule,
    } = useCategoryRules(category.id);

    const onCreateRule = async (
        data: CategoryRuleFormState,
        { reset }: { reset: () => void }
    ) => {
        await createRule(data);
        reset();

        setTimeout(async () => {
            await revalidateTransactions();
            if (typeof onChange === "function") {
                await onChange();
            }
        }, 100);
    };

    const onUpdateRule =
        (ruleId: number) => async (data: CategoryRuleFormState) => {
            await updateRule(ruleId, data);
            await revalidateTransactions();

            if (typeof onChange === "function") {
                await onChange();
            }
        };

    const onDeleteRule = async (ruleId: number) => {
        setDeletingRuleId(ruleId);
        await deleteRule(ruleId);
        setDeletingRuleId(null);
        await revalidateTransactions();

        if (typeof onChange === "function") {
            await onChange();
        }
    };

    return (
        <div className="category-dashboard">
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
                                    <div className="flex items-center gap-x-2">
                                        <div>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                disabled={
                                                    deletingRuleId === rule.id
                                                }
                                                onClick={() =>
                                                    onDeleteRule(rule.id)
                                                }
                                            >
                                                {deletingRuleId === rule.id
                                                    ? "Deleting"
                                                    : "Delete"}
                                            </button>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-primary"
                                                disabled={disabled}
                                            >
                                                {busy ? "Updating" : "Update"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    ))}
                <div className="bg-sky-100 p-4 mb-4">
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

                {isLoading && (
                    <div className="loading">Loading Transactions...</div>
                )}
                {!isLoading && (
                    <div>
                        <h2 className="text-xl mb-2">Transactions</h2>
                        <div className="mb-4">
                            <div>
                                Category is matching {transactions.length} of{" "}
                                {accountTransactions.length} transactions.
                            </div>
                            <div>
                                <span className="text-green-600">
                                    {formatCurrency(totals.incoming)}{" "}
                                </span>
                                Incoming,{" "}
                                <span className="text-red-600">
                                    {formatCurrency(totals.outgoing)}{" "}
                                </span>
                                Outgoing,{" "}
                                <span className="text-sky-600">
                                    {formatCurrency(totals.net)}{" "}
                                </span>
                                Net
                            </div>
                        </div>
                        <TransactionsTableReadonly
                            transactions={accountTransactions}
                            matchedTransactionsIds={transactionIds}
                            height={600}
                            search={search}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
