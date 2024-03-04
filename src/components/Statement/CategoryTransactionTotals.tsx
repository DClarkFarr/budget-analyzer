import { Transaction } from "@/types/Account/Transaction";
import { Category, CategoryType } from "@/types/Statement";
import { DateTime } from "luxon";

export default function CategoryTransactionTotals({
    type,
    groups,
    date,
}: {
    type: CategoryType;
    groups: { category: Category; transactions: Transaction[] }[];
    date: DateTime;
}) {
    const typeName = { expense: "Expense", income: "Income", ignore: "other" }[
        type
    ];

    return (
        <div className="category category--totals rounded border border-slate-400">
            <div className="category__heading p-4 text-xl font-semibold bg-slate-200 border-b border-slate-400">
                {typeName}
            </div>
            <div className="category__body p-4"></div>
        </div>
    );
}
