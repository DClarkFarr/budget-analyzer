import CategoryDashboard from "@/components/Category/CategoryDashboard";
import CategoryDashboardHeader from "@/components/Category/CategoryDashboardHeader";

import { getSessionUser } from "@/server/actions/sessionActions";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getCategory } from "@/server/prisma/account/category.methods";
import { getAccountTransactions } from "@/server/prisma/account/statement.methods";
import { Category } from "@/types/Statement";
import { DateTime } from "luxon";
import { useParams, useRouter } from "next/navigation";

export default async function CategoryManagePage({
    params,
    searchParams,
}: {
    params: { accountId: string; categoryId: string };
    searchParams: { year: string };
}) {
    const user = (await getSessionUser())!;
    const account = (await getUserAccount(
        user.id,
        parseInt(params.accountId)
    ))!;

    const category = (await getCategory(
        parseInt(params.categoryId)
    ))! as unknown as Category;

    const year = searchParams.year ? parseInt(searchParams.year) : undefined;

    const minDate = year
        ? DateTime.fromObject({ year, month: 1, day: 1 })
        : undefined;
    const maxDate = minDate ? minDate.endOf("year") : undefined;

    const accountTransactions =
        (await getAccountTransactions(account.id, {
            minDate: minDate?.toISO() || undefined,
            maxDate: maxDate?.toISO() || undefined,
        })) || [];

    return (
        <div className="category-single">
            <h1 className="text-2xl">
                <div>Manage Category</div>
            </h1>
            <CategoryDashboardHeader account={account} category={category} />
            <CategoryDashboard
                category={category}
                account={account}
                accountTransactions={accountTransactions}
            />
        </div>
    );
}
