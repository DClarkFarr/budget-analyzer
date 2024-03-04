"use client";

import { Account } from "@/types/Account";
import { Category } from "@/types/Statement";
import Link from "next/link";
import Select, { SingleValue } from "react-select";
import { useRouter } from "next/navigation";
import useAccountCategories from "@/hooks/useAccountCategories";
import { useEffect, useMemo, useState } from "react";
import { useAccountContext } from "../Providers/AccountProvider";
import useQueryParams from "@/hooks/useQueryParams";

export default function CategoryDashboardHeader({
    account,
    category,
}: {
    account: Account;
    category: Category;
}) {
    const { currentYear } = useAccountContext();
    const { categories } = useAccountCategories(account.id, currentYear);

    const id = Date.now().toString();
    const [isMounted, setIsMounted] = useState(false);

    // Must be deleted once
    // https://github.com/JedWatson/react-select/issues/5459 is fixed.
    useEffect(() => setIsMounted(true), []);

    const { buildUrl, redirect } = useQueryParams();

    const onSelectCategory = (newValue: SingleValue<Category>) => {
        if (newValue) {
            redirect(
                `/dashboard/account/${account.id}/category/${newValue.id}`
            );
        }
    };

    const toCategoriesUrl = useMemo(() => {
        return buildUrl({
            path: `/dashboard/account/${account.id}`,
            params: {
                view: "categories",
                year: currentYear,
            },
        });
    }, [account.id, currentYear]);

    return (
        <div className="flex items-center gap-x-2 mb-4">
            <div>
                <span className="pr-1">Account:</span>
                <Link
                    href={toCategoriesUrl}
                    className="text-sky-600 hover:underline"
                >
                    {account.name}
                </Link>
            </div>
            <div>&gt;</div>
            <div>
                Current: <b>{category.name}</b>
            </div>
            <div>
                {isMounted && (
                    <Select
                        key={id}
                        className="w-[200px]"
                        options={categories}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id.toString()}
                        value={category}
                        isSearchable
                        placeholder="Select a category..."
                        onChange={onSelectCategory}
                    />
                )}
            </div>
        </div>
    );
}
