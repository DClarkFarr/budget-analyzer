"use client";

import DuplicateTransactionsTable from "../Statement/DuplicateTransactionsTable";
import TransactionsTable from "../Statement/TransactionsTable";
import { useDuplicateQuery } from "@/hooks/useDuplicateQuery";

export default function DuplicateList({ accountId }: { accountId: number }) {
    const { transactions, isLoading, moveTransactionToCategory } =
        useDuplicateQuery(accountId);

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
                    <DuplicateTransactionsTable
                        transactions={transactions}
                        onSelectCategory={moveTransactionToCategory}
                    />
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
