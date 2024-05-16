"use client";

import TransactionsTable from "../Statement/TransactionsTable";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { CategorySelector } from "../Control/CategorySelector";
import { useEffect, useState, useTransition } from "react";
import { useMoveTransactionMutation } from "@/hooks/useDuplicateQuery";
import { useAccountContext } from "../Providers/AccountProvider";

import "./CategorizedList.scss";

export default function CategorizedList({
    accountId,
    transactions,
}: {
    accountId: number;
    transactions: WithCategories<Transaction>[];
}) {
    const { account, currentYear } = useAccountContext();

    const [, transition] = useTransition();

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
            ...old,
            ...transactionsToObject(transactions),
        }));

        setAssigningTransactions((old) => ({
            ...old,
            ...transactionsToObject(transactions),
        }));
    }, [transactions.length]);

    const onSelectCategory =
        (transactionId: number) => (categoryId: number | null) => {
            setTransactionCategories((old) => ({
                ...old,
                [transactionId]: categoryId,
            }));
        };

    const moveTransactionToCategory = useMoveTransactionMutation(
        accountId,
        currentYear
    );

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
            key: "categorize",
            heading: "Category",
            cell: (t: WithCategories<Transaction>) => (
                <>
                    <div className="flex items-center gap-x-2 mb-2">
                        <CategorySelector
                            accountId={accountId}
                            selectedId={t.categories[0]?.id}
                            year={currentYear}
                            onSelect={onSelectCategory(t.id)}
                        />
                        {!!transactionCategories[t.id] && (
                            <div>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() =>
                                        onAssignTransaction(
                                            t.id,
                                            transactionCategories[t.id]!
                                        )
                                    }
                                    disabled={!!assigningTransactions[t.id]}
                                >
                                    {!!assigningTransactions[t.id]
                                        ? "Assigning..."
                                        : "Assign"}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="quick-categories flex flex-wrap gap-2">
                        {t.categories.map((c) => {
                            const typeClass = {
                                income: "bg-emerald-600",
                                expense: "bg-red-600",
                                ignore: "bg-sky-600",
                            }[c.type];

                            if (c.id === t.categories[0]?.id) {
                                return null;
                            }

                            return (
                                <button
                                    className={`btn btn-sm ${typeClass}`}
                                    key={c.id}
                                    onClick={() =>
                                        onAssignTransaction(t.id, c.id)
                                    }
                                    disabled={!!assigningTransactions[t.id]}
                                >
                                    {!!assigningTransactions[t.id]
                                        ? "Assigning..."
                                        : c.name}
                                </button>
                            );
                        })}
                    </div>
                </>
            ),
        },
    ];

    return (
        <>
            <div>
                <h1 className="text-2xl mb-2">Categorized Transactions</h1>
            </div>
            {
                <div>
                    <TransactionsTable
                        transactions={transactions}
                        withCategories={true}
                        showCategories={false}
                        slots={tableSlots}
                    />
                </div>
            }
        </>
    );
}
