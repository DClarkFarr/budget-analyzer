"use client";

import { useUncategorizedQuery } from "@/hooks/useUncategorizedQuery";
import TransactionsTable from "../Statement/TransactionsTable";
import { Transaction } from "@/types/Account/Transaction";
import { CategorySelector } from "../Control/CategorySelector";
import { useEffect, useMemo, useRef, useState } from "react";
import useCategoriesQuery from "@/hooks/useCategoriesQuery";
import { useMoveTransactionMutation } from "@/hooks/useDuplicateQuery";

export default function UncategorizedList({
  accountId,
}: {
  accountId: number;
}) {
  const { transactions, isLoading } = useUncategorizedQuery(accountId);

  const transactionsToObject = (ts: Transaction[]) => {
    return ts.reduce((acc, t) => {
      acc[t.id] = null;

      return acc;
    }, {} as Record<number, number | null>);
  };

  const [transactionCategories, setTransactionCategories] = useState(
    transactionsToObject(transactions)
  );

  const [assigningTransactions, setAssigningTransactions] = useState(
    transactionsToObject(transactions)
  );

  useEffect(() => {
    setTransactionCategories((old) => ({
      ...transactionsToObject(transactions),
      ...old,
    }));

    setAssigningTransactions((old) => ({
      ...transactionsToObject(transactions),
      ...old,
    }));

    console.log("transactions were", transactions);
  }, [transactions.length]);

  const onSelectCategory =
    (transactionId: number) => (categoryId: number | null) => {
      setTransactionCategories((old) => ({
        ...old,
        [transactionId]: categoryId,
      }));
    };

  const moveTransactionToCategory = useMoveTransactionMutation(accountId);

  const onAssignTransaction = async (
    transactionId: number,
    categoryId: number
  ) => {
    setAssigningTransactions((old) => ({
      ...old,
      [transactionId]: categoryId,
    }));

    await moveTransactionToCategory(categoryId, transactionId);

    setAssigningTransactions((old) => ({
      ...old,
      [transactionId]: null,
    }));

    setTransactionCategories((old) => ({
      ...old,
      [transactionId]: null,
    }));
  };

  const tableSlots = [
    {
      key: "actions",
      heading: "Actions",
      cell: (t: Transaction) => (
        <div className="flex items-center gap-x-2">
          <CategorySelector
            accountId={accountId}
            onSelect={onSelectCategory(t.id)}
          />
          {!!transactionCategories[t.id] && (
            <div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() =>
                  onAssignTransaction(t.id, transactionCategories[t.id]!)
                }
                disabled={!!assigningTransactions[t.id]}
              >
                {!!assigningTransactions[t.id] ? "Assigning..." : "Assign"}
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl mb-2">Uncategorized Transactions</h1>
        <p className="mb-4">Remaining items to be sorted</p>
      </div>
      {isLoading && <div>Loading translations...</div>}
      {!isLoading && (
        <div>
          <TransactionsTable
            transactions={transactions}
            slots={tableSlots}
            footer={
              <>
                {!isLoading && transactions.length === 0 && (
                  <div className="pt-3">
                    No uncategorized transactions found. Good job!
                  </div>
                )}
              </>
            }
          />
        </div>
      )}
    </>
  );
}
