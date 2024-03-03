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
import CategoryDashboard from "../Category/CategoryDashboard";
import { Category } from "@/types/Statement";

export default function UncategorizedList({
    accountId,
}: {
    accountId: number;
}) {
    const { account, currentYear } = useAccountContext();
    const {
        transactions,
        isLoading,
        revalidate: revalidateTransactions,
    } = useUncategorizedQuery(accountId, currentYear);

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
            heading: "Add transaction rule to category",
            onClose: async () => {
                setCategoryPanelState({
                    category: null,
                    transaction: null,
                });
            },
        });

    const onClickAddToCategory = (t: Transaction) => {
        setCategoryPanelState({
            category: null,
            transaction: t,
        });
        categoryPanelMethods.open();
    };

    const [categoryPanelState, setCategoryPanelState] = useState<{
        category: Category | null;
        transaction: Transaction | null;
    }>({
        category: null,
        transaction: null,
    });

    const onSelectPanelCategory = (
        categoryId: number | null,
        category: Category | null
    ) => {
        setCategoryPanelState((old) => ({
            ...old,
            category,
        }));
    };

    const onChangeCategoryRules = async () => {
        revalidateTransactions();
        categoryPanelMethods.close();
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
                                    onClick={() => onClickAddToCategory(t)}
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
                <div className="w-full mb-4">
                    <CategorySelector
                        accountId={accountId}
                        year={currentYear}
                        onSelect={onSelectPanelCategory}
                    />
                </div>
                <div className="mb-4">
                    {!categoryPanelState.category && (
                        <div>
                            Select a category to assign the transaction to.
                        </div>
                    )}
                    {categoryPanelState.category &&
                        categoryPanelState.transaction && (
                            <>
                                <div className="div">
                                    <h3 className="font-bold">Transaction</h3>
                                    <div className="flex w-full p-2 text-[12px] bg-gray-200 mb-2">
                                        {
                                            categoryPanelState.transaction
                                                .description
                                        }
                                    </div>
                                </div>
                                <CategoryDashboard
                                    category={categoryPanelState.category}
                                    account={account!}
                                    accountTransactions={transactions}
                                    onChange={onChangeCategoryRules}
                                    search={
                                        categoryPanelState.transaction
                                            .description
                                    }
                                />
                            </>
                        )}
                </div>
            </SidePanel>
        </>
    );
}
