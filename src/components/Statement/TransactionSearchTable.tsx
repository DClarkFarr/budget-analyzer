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
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function TransactionSearchTable({
    visibleFilters,
    excludedTransactionIds,
    transactions,
    onToggleExcluded,
}: {
    visibleFilters: number[];
    excludedTransactionIds: number[];
    transactions: WithFoundIndexes<WithCategories<Transaction>>[];
    onToggleExcluded: (transactionId: number, exclude: boolean) => void;
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

    const trandTotals = sumSearchTransactions(
        transactions,
        visibleFilters,
        excludedTransactionIds
    );

    return (
        <div className="search-transactions">
            <div className="flex gap-x-4">
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Search Results
                    </h3>
                </div>

                <div className="text-emerald-600">
                    In: {formatCurrency(trandTotals.incoming)}
                </div>
                <div className="text-red-600">
                    Out: {formatCurrency(trandTotals.outgoing)}
                </div>
                <div className="font-semibold">
                    Net: {formatCurrency(trandTotals.net)}
                </div>
                {trandTotals.ignored > 0 && (
                    <div className="text-gray-600">
                        Ignored: {formatCurrency(trandTotals.ignored)}
                    </div>
                )}
            </div>
            <div className="divide-y divide-gray-400">
                {monthlyTransactions.map(({ month, transactions }) => {
                    const totals = sumSearchTransactions(
                        transactions,
                        visibleFilters,
                        excludedTransactionIds
                    );

                    const Heading = () => (
                        <>
                            <div className="font-semibold">
                                {DateTime.fromISO(month).toFormat("MMM yyyy")}
                            </div>
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
                        <PaneDropdown heading={<Heading />} key={month}>
                            <table className="transactions__table table table--striped text-sm w-full table--sm">
                                <tbody>
                                    <tr>
                                        <th>Account</th>
                                        <th className="w-[50px]">Day</th>
                                        <th>Description</th>
                                        <th className="text-right">Amount</th>
                                        <th></th>
                                    </tr>
                                    {transactions.map((t) => {
                                        const isExcluded =
                                            excludedTransactionIds.includes(
                                                t.id
                                            );
                                        return (
                                            <tr
                                                className={`type-${
                                                    t.expenseType
                                                } ${
                                                    isExcluded
                                                        ? "excluded bg-red-400 opacity-50"
                                                        : ""
                                                }`}
                                                key={t.id}
                                            >
                                                <td>
                                                    {t.categories
                                                        .map((c) => c.name)
                                                        .join(", ")}
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {DateTime.fromISO(
                                                        t.date
                                                    ).toFormat("dd")}
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
                                                <td>
                                                    {isExcluded && (
                                                        <button
                                                            className="btn btn-sm bg-red-700"
                                                            onClick={() =>
                                                                onToggleExcluded(
                                                                    t.id,
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaEyeSlash />
                                                        </button>
                                                    )}
                                                    {!isExcluded && (
                                                        <button
                                                            className="btn btn-sm bg-sky-700"
                                                            onClick={() =>
                                                                onToggleExcluded(
                                                                    t.id,
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <FaEye />
                                                        </button>
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
        </div>
    );
}
