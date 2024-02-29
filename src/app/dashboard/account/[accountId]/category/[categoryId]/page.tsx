import CategoryDashboard from "@/components/Category/CategoryDashboard";
import CategoryDashboardHeader from "@/components/Category/CategoryDashboardHeader";

import { getSessionUser } from "@/server/actions/sessionActions";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getCategory } from "@/server/prisma/account/category.methods";
import { getAccountTransactions } from "@/server/prisma/account/statement.methods";
import { Category } from "@/types/Statement";

export default async function CategoryManagePage({
    params,
}: {
    params: { accountId: string; categoryId: string };
}) {
    const user = (await getSessionUser())!;
    const account = (await getUserAccount(
        user.id,
        parseInt(params.accountId)
    ))!;

    const category = (await getCategory(
        parseInt(params.categoryId)
    ))! as unknown as Category;

    const accountTransactions =
        (await getAccountTransactions(account.id)) || [];

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
