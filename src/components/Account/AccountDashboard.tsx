"use client";

import useAccountQuery, {
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
} from "@/hooks/useAccountQuerry";
import { User } from "@/types/User";
import TransactionsTable from "../Statement/TransactionsTable";
import TabsView, { Tab } from "../Control/TabsView";
import StatementTransactionRange from "../Statement/StatementTransactionRange";
import CategoryList from "./CategoryList";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryFormState } from "@/types/Statement";
import UncategorizedList from "./UncategorizedList";
import DuplicateList from "./DuplicateList";
import { useAccountContext } from "../Providers/AccountProvider";
import useQueryParams from "@/hooks/useQueryParams";

export default function AccountDashboard({
    user,
    accountId,
}: {
    user: User;
    accountId: number;
}) {
    const { account, currentYear } = useAccountContext();

    const { transactions, isLoading, categories } = useAccountQuery(
        accountId,
        currentYear,
        { withCategories: true }
    );

    const { createCategory } = useCreateCategoryMutation(
        accountId,
        currentYear
    );
    const { deleteCategory } = useDeleteCategoryMutation(
        accountId,
        currentYear
    );
    const { updateCategory } = useUpdateCategoryMutation(
        accountId,
        currentYear
    );

    const { pushQuery } = useQueryParams();

    const onCreateCategory = async (data: CategoryFormState) => {
        await createCategory(data);
    };

    const onDeleteCategory = async (categoryId: number) => {
        await deleteCategory(categoryId);
    };

    const onCategoryUpdate = async (
        categoryId: number,
        data: CategoryFormState
    ) => {
        await updateCategory(categoryId, data);
    };

    const tabs: Tab[] = [
        {
            label: "Totals",
            key: "totals",
            pane: (
                <StatementTransactionRange
                    transactions={transactions}
                    account={account!}
                    year={currentYear}
                />
            ),
        },
        {
            label: "Transactions",
            key: "transactions",
            pane: (
                <TransactionsTable
                    transactions={transactions}
                    withCategories={true}
                />
            ),
        },
        {
            label: "Categories",
            key: "categories",
            pane: (
                <CategoryList
                    categories={categories}
                    onCreateCategory={onCreateCategory}
                    onDeleteCategory={onDeleteCategory}
                    onUpdateCategory={onCategoryUpdate}
                    year={currentYear}
                />
            ),
        },
        {
            label: "Uncategorized Transactions",
            key: "uncategorized",
            pane: <UncategorizedList accountId={accountId} />,
        },
        {
            label: "Duplicate Transactions",
            key: "duplicates",
            pane: <DuplicateList accountId={accountId} />,
        },
    ];

    const [view, setView] = useState(
        "totals" as "totals" | "transactions" | "categories"
    );

    const search = useSearchParams();

    useEffect(() => {
        const initialView = search.get("view");
        if (initialView) {
            setView(initialView as "totals" | "transactions" | "categories");
        }
    }, []);

    const onChangeTab = (view: string) => {
        setView(view as "totals" | "transactions" | "categories");
        pushQuery({ view });
    };

    return (
        <div className="account-dashboard">
            {isLoading && (
                <div className="p-[100px] w-full flex justify-center items-center text-2xl text-gray-500 font-semibold">
                    Loading...
                </div>
            )}
            {!isLoading && account && (
                <>
                    <TabsView
                        tabs={tabs}
                        onTabChange={onChangeTab}
                        activeTab={view}
                    />
                </>
            )}
        </div>
    );
}
