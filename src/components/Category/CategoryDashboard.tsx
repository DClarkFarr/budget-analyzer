"use client";

import useCategoryTransactions from "@/hooks/useCategoryTransactions";
import { Account } from "@/types/Account";
import { Category } from "@/types/Statement";
import RuleForm from "./RuleForm";
import { Transaction } from "@/types/Account/Transaction";

export default function CategoryDashboard({
    category,
    account,
    accountTransactions,
}: {
    category: Category;
    account: Account;
    accountTransactions: Transaction[];
}) {
    const { transactions, isLoading } = useCategoryTransactions(category.id);

    return (
        <div className="category-dashboard">
            <div className="mb-4">
                Category is matching {transactions.length} of{" "}
                {accountTransactions.length} transactions.
            </div>
            <div className="rules flex flex-col gap-y-3 mb-4">
                <div className="bg-sky-100 p-4">
                    <h4 className="font-semibold">Create New Rule</h4>
                    <RuleForm
                        transactions={accountTransactions}
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
