"use client";

import { useUncategorizedQuery } from "@/hooks/useUncategorizedQuery";
import TransactionsTable from "../Statement/TransactionsTable";

export default function UncategorizedList({
    accountId,
}: {
    accountId: number;
}) {
    const { transactions, isLoading } = useUncategorizedQuery(accountId);

    return (
        <>
            <div>
                <h1 className="text-2xl mb-2">Uncategorized Transactions</h1>
                <p className="mb-4">Remaining items to be sorted</p>
            </div>
            {isLoading && <div>Loading translations...</div>}
            {!isLoading && (
                <div>
                    <TransactionsTable transactions={transactions} />
                </div>
            )}
            {!isLoading && transactions.length === 0 && (
                <div className="pt-3">
                    No uncategorized transactions found. Good job!
                </div>
            )}
        </>
    );
}
