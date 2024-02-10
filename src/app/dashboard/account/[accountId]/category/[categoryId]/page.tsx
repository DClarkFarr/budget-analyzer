import CategoryDashboard from "@/components/Category/CategoryDashboard";
import { getSessionUser } from "@/server/actions/sessionActions";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getCategory } from "@/server/prisma/account/category.methods";
import { Category } from "@/types/Statement";
import Link from "next/link";

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
        parseInt(params.accountId),
        parseInt(params.categoryId)
    ))! as unknown as Category;

    return (
        <div className="category-single">
            <h1 className="text-2xl">
                <div>Manage Category</div>
            </h1>
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
                    <span className="pr-1">Category:</span>
                    <b>{category.name}</b>
                </div>
            </div>
            <CategoryDashboard category={category} account={account} />
        </div>
    );
}
