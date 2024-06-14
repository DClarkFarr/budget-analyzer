import {
    Transaction,
    WithCategories,
    WithFoundIndexes,
} from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import { useMemo } from "react";
import PaneDropdown from "../Control/PaneDropdown";
import { sumSearchTransactions } from "@/methods/statement";
import { formatCurrency } from "@/methods/currency";

export default function TransactionSearchTable({
    visibleFilters,
    transactions,
}: {
    visibleFilters: number[];
    transactions: WithFoundIndexes<WithCategories<Transaction>>[];
}) {
    const isTransactionVisible = (
        t: WithFoundIndexes<Transaction>,
        visibleFilters: number[]
    ) => {
        if (visibleFilters.some((fi) => t.foundbyFilters.includes(fi))) {
            return true;
        }

        return false;
    };
    const monthlyTransactions = useMemo(() => {
        const months = transactions.reduce((acc, t) => {
            if (!isTransactionVisible(t, visibleFilters)) {
                return acc;
            }
            const month =
                DateTime.fromISO(t.date).startOf("month").toISO() || "";
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(t);
            return acc;
        }, {} as Record<string, typeof transactions>);

        return Object.entries(months).map(([month, transactions]) => {
            return {
                month,
                transactions,
            };
        });
    }, [transactions, visibleFilters]);
    return (
        <div className="search-transactions">
            <h3 className="text-xl font-semibold mb-4">Search Results</h3>
            <div className="divide-y divide-gray-400">
                {monthlyTransactions.map(({ month, transactions }) => {
                    const totals = sumSearchTransactions(
                        transactions,
                        visibleFilters
                    );
                    const Heading = () => (
                        <>
                            <div className="font-semibold">
                                {DateTime.fromISO(month).toFormat("DD")}
                            </div>
                            <div className="text-emerald-600">
                                In: {formatCurrency(totals.incoming)}
                            </div>
                            <div className="text-red-600">
                                Out: {formatCurrency(totals.outgoing)}
                            </div>
                            <div className="ml-auto font-semibold">
                                {formatCurrency(totals.net)}
                            </div>
                        </>
                    );
                    return (
                        <PaneDropdown heading={<Heading />} key={month}>
                            <table className="transactions__table table table--striped w-full table--sm">
                                <tbody>
                                    <tr>
                                        <th className="w-[85px]">Date</th>
                                        <th>Description</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                    {transactions.map((t) => (
                                        <tr
                                            className={`type-${t.expenseType}`}
                                            key={t.id}
                                        >
                                            <td className="whitespace-nowrap">
                                                {DateTime.fromISO(
                                                    t.date
                                                ).toFormat("DD")}
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
                                    ))}
                                </tbody>
                            </table>
                        </PaneDropdown>
                    );
                })}
            </div>
        </div>
    );
}
