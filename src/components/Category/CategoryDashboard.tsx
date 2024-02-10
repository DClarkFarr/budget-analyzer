"use client";

import useCategoryTransactions from "@/hooks/useCategoryTransactions";
import { Account } from "@/types/Account";
import { Category } from "@/types/Statement";

export default function CategoryDashboard({
    category,
    account,
}: {
    category: Category;
    account: Account;
}) {
    const { transactions, isLoading } = useCategoryTransactions(category.id);

    return (
        <div className="category-dashboard">
            Category dashboard has {transactions.length} transactions.
        </div>
    );
}
