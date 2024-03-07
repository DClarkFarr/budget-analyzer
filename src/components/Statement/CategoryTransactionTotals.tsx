import { formatCurrency } from "@/methods/currency";
import { sumCategoryTypeTransactions } from "@/methods/statement";
import { toLuxonDate } from "@/server/methods/date";
import { Transaction } from "@/types/Account/Transaction";
import { Category, CategoryType } from "@/types/Statement";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

const CategoryDropdown = ({
    category,
    transactions,
}: {
    category: Category;
    transactions: Transaction[];
}) => {
    const [open, setOpen] = useState(false);

    const totals = useMemo(() => {
        return sumCategoryTypeTransactions(category.type, transactions, false);
    }, [transactions]);

    return (
        <div className="category-dropdown">
            <div
                className="category-dropdown__header items-center flex gap-x-2 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <div>{open ? <FaCaretDown /> : <FaCaretRight />}</div>
                <div className="category-dropdown__title text-semibold text-lg">
                    {category.name}
                </div>
                <div className="text-lg ml-auto">
                    {formatCurrency(totals.net)}
                </div>
            </div>
            {open && (
                <div className="category-dropdown__body p-2 pl-6">
                    <table className="table table--sm table--striped w-full">
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        {DateTime.fromISO(t.date).toFormat(
                                            "DD"
                                        )}
                                    </td>
                                    <td>{t.description}</td>
                                    <td>{formatCurrency(t.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default function CategoryTransactionTotals({
    type,
    groups,
    date,
}: {
    type: CategoryType;
    groups: { category: Category; transactions: Transaction[] }[];
    date: DateTime;
}) {
    const typeName = { expense: "Expense", income: "Income", ignore: "Other" }[
        type
    ];

    const total = useMemo(() => {
        return groups.reduce((acc, group) => {
            return (
                acc +
                sumCategoryTypeTransactions(type, group.transactions, false).net
            );
        }, 0);
    }, [groups]);

    return (
        <div className="category category--totals rounded border border-slate-400">
            <div className="category__heading p-4 text-xl font-semibold bg-slate-200 border-b border-slate-400">
                {typeName}
            </div>
            <div className="category__body p-4">
                {groups.map((group) => (
                    <div className="mb-4" key={group.category.id}>
                        <CategoryDropdown
                            category={group.category}
                            transactions={group.transactions}
                        />
                    </div>
                ))}
            </div>
            <div className="category__footer p-4 bg-sky-100 flex w-full text-lg">
                <div className="font-light">Total:</div>
                <div className="ml-auto font-semibold">
                    {formatCurrency(total)}
                </div>
            </div>
        </div>
    );
}
