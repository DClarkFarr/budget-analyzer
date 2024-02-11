"use client";

import { useUncategorizedQuery } from "@/hooks/useUncategorizedQuery";
import TransactionsTable from "../Statement/TransactionsTable";

export default function DuplicateList({ accountId }: { accountId: number }) {
    const { transactions, isLoading } = useUncategorizedQuery(accountId);

    return (
        <>
            <div>
                <h1 className="text-2xl mb-2">Duplicate Transactions</h1>
                <p className="mb-4">
                    These transactions appear on more than one category. Pick
                    the one category to rule them all!
                </p>
            </div>
            {isLoading && <div>Loading translations...</div>}
            {!isLoading && (
                <div>
                    <TransactionsTable transactions={transactions} />
                </div>
            )}
            {!isLoading && transactions.length === 0 && (
                <div className="pt-3">
                    No duplicate transactions found. Good job!
                </div>
            )}
        </>
    );
}
