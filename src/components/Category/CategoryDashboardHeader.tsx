"use client";

import { Account } from "@/types/Account";
import { Category } from "@/types/Statement";
import Link from "next/link";
import Select, { SingleValue } from "react-select";
import { useRouter } from "next/navigation";
import useAccountCategories from "@/hooks/useAccountCategories";

export default function CategoryDashboardHeader({
    account,
    category,
}: {
    account: Account;
    category: Category;
}) {
    const { categories } = useAccountCategories(account.id);

    const router = useRouter();

    const onSelectCategory = (newValue: SingleValue<Category>) => {
        if (newValue) {
            router.push(
                `/dashboard/account/${account.id}/category/${newValue.id}`
            );
        }
    };

    return (
        <div className="flex items-center gap-x-2 mb-4">
            <div>
                <span className="pr-1">Account:</span>
                <Link
                    href={`/dashboard/account/${account.id}?view=categories`}
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
                <Select
                    className="w-[200px]"
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id.toString()}
                    value={category}
                    isSearchable
                    placeholder="Select a category..."
                    onChange={onSelectCategory}
                />
            </div>
        </div>
    );
}
