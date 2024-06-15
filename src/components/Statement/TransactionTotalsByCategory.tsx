import { formatCurrency } from "@/methods/currency";
import { sumCategoryTypeTransactions } from "@/methods/statement";
import { Account } from "@/types/Account";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { Category } from "@/types/Statement";
import { DateTime } from "luxon";
import { useMemo } from "react";
import PaneDropdown from "../Control/PaneDropdown";

export default function TransactionsByCategory({
    transactions,
    year,
    account,
}: {
    transactions: WithCategories<Transaction>[];
    year: number;
    account: Account;
}) {
    const categoriesGrouped = useMemo(() => {
        const map = new Map<
            number,
            { category: Category; rows: Transaction[] }
        >();

        transactions.forEach((t) => {
            t.categories.forEach((c) => {
                if (!map.has(c.id)) {
                    map.set(c.id, { category: c, rows: [] });
                }
                map.get(c.id)?.rows.push(t);
            });

            if (!t.categories.length) {
                if (!map.has(-1)) {
                    map.set(-1, {
                        category: {
                            id: -1,
                            name: "Uncategorized",
                            type: "ignore",
                            accountId: account.id,
                            userId: account.userId,
                            createdAt: new Date().toISOString(),
                            startAt: new Date().toISOString(),
                            endAt: new Date().toISOString(),
                        },
                        rows: [],
                    });
                }
                map.get(-1)?.rows.push(t);
            }
        });

        return Array.from(map.values()).sort((a, b) => {
            return a.category.name.localeCompare(b.category.name);
        });
    }, [transactions]);

    return (
        <div className="transactions-by-category flex flex-col gap-2">
            {categoriesGrouped.map(({ category, rows }) => {
                const totals = sumCategoryTypeTransactions(
                    category.type,
                    rows,
                    false
                );

                const Heading = () => (
                    <>
                        <div className="font-semibold">{category.name}</div>
                        <div className="text-emerald-600">
                            In: {formatCurrency(totals.incoming)}
                        </div>
                        <div className="text-red-600">
                            Out: {formatCurrency(totals.outgoing)}
                        </div>
                        {totals.ignored > 0 && (
                            <div className="text-gray-600">
                                Ignored: {formatCurrency(totals.ignored)}
                            </div>
                        )}
                        <div className="ml-auto font-semibold">
                            {formatCurrency(totals.net)}
                        </div>
                    </>
                );

                return (
                    <PaneDropdown heading={<Heading />} key={category.id}>
                        <table className="transactions__table table table--striped text-sm w-full table--sm">
                            <tbody>
                                <tr>
                                    <th className="w-[50px]">Date</th>
                                    <th>Description</th>
                                    <th className="text-right">Amount</th>
                                    <th></th>
                                </tr>
                                {rows.map((t) => {
                                    return (
                                        <tr
                                            className={`type-${t.expenseType}`}
                                            key={t.id}
                                        >
                                            <td className="whitespace-nowrap">
                                                {DateTime.fromISO(
                                                    t.date
                                                ).toFormat("DDD")}
                                            </td>

                                            <td>{t.description}</td>
                                            <td>
                                                {formatCurrency(
                                                    t.amount *
                                                        (t.expenseType ===
                                                        "incoming"
                                                            ? 1
                                                            : -1)
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </PaneDropdown>
                );
            })}
        </div>
    );
}
