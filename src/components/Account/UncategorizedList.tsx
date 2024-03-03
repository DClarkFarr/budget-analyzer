"use client";

import { useUncategorizedQuery } from "@/hooks/useUncategorizedQuery";
import TransactionsTable from "../Statement/TransactionsTable";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { CategorySelector } from "../Control/CategorySelector";
import { useEffect, useState } from "react";
import { useMoveTransactionMutation } from "@/hooks/useDuplicateQuery";
import { useAccountContext } from "../Providers/AccountProvider";

import { Dropdown } from "flowbite-react";

import "./UncategorizedList.scss";
import { SidePanel, useSidePanel } from "../Modal/SidePanel";

export default function UncategorizedList({
    accountId,
}: {
    accountId: number;
}) {
    const { currentYear } = useAccountContext();
    const { transactions, isLoading } = useUncategorizedQuery(
        accountId,
        currentYear
    );

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

    const { props: categoryPanelProps, methods: categoryPanelMethods } =
        useSidePanel({
            id: "category-panel",
            width: 800,
        });

    const onClickAddToCategory = () => {
        categoryPanelMethods.open();
    };

    const tableSlots = [
        {
            key: "categorize",
            heading: "Select Category",
            cell: (t: WithCategories<Transaction>) => (
                <>
                    <div className="flex items-center gap-x-2 mb-2">
                        <CategorySelector
                            accountId={accountId}
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
        {
            key: "actions",
            heading: "Actions",
            cell: (t: WithCategories<Transaction>) => (
                <>
                    <div className="flex items-center gap-x-2 mb-2">
                        <div className="action-dropdown">
                            <Dropdown label="Group Actions">
                                <Dropdown.Item
                                    as="div"
                                    onClick={() => onClickAddToCategory()}
                                >
                                    Add To Category
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as="a"
                                    href="https://flowbite.com/"
                                    target="_blank"
                                >
                                    External link
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                    </div>
                </>
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
                        withCategories={true}
                        showCategories={false}
                        slots={tableSlots}
                        footer={
                            <>
                                {!isLoading && transactions.length === 0 && (
                                    <div className="pt-3">
                                        No uncategorized transactions found.
                                        Good job!
                                    </div>
                                )}
                            </>
                        }
                    />
                </div>
            )}

            <SidePanel {...categoryPanelProps}>
                <div>My custom stuff says hi</div>
            </SidePanel>
        </>
    );
}
