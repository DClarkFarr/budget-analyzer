import { formatCurrency } from "@/methods/currency";
import { Account } from "@/types/Account";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo } from "react";

export default function TransactionsByMonth({
    startDate,
    endDate,
    transactions,
    year,
    account,
}: {
    startDate: string;
    endDate: string;
    transactions: WithCategories<Transaction>[];
    year: number;
    account: Account;
}) {
    const monthsToShow = useMemo(() => {
        const months: DateTime[] = [];

        let sd = startDate
            ? DateTime.fromISO(startDate).startOf("month")
            : DateTime.now().startOf("year");
        const ed = endDate
            ? DateTime.fromISO(endDate)
            : DateTime.now().startOf("month");

        let c = 0;
        while (sd < ed) {
            months.push(sd);
            sd = sd.plus({ months: 1 });
            c++;

            if (c > 100) {
                console.warn("you are stupid");
                break;
            }
        }

        return months;
    }, [startDate, endDate]);

    const transactionsByMonth = useMemo(() => {
        const map: Record<
            string,
            { incoming: number; outgoing: number; net: number }
        > = {};

        transactions.forEach((t) => {
            const isIgnored =
                t.categories.length &&
                t.categories.every((c) => c.type === "ignore");
            if (isIgnored) {
                return;
            }

            const month = DateTime.fromISO(t.date).toFormat("yyyy-MM");
            if (!map[month]) {
                map[month] = { incoming: 0, outgoing: 0, net: 0 };
            }

            if (t.expenseType === "incoming") {
                map[month].incoming += t.amount;
            } else {
                map[month].outgoing += t.amount;
            }

            map[month].net +=
                t.expenseType === "incoming" ? t.amount : -t.amount;
        });

        return map;
    }, [transactions]);

    return (
        <div className="transactions-by-month flex flex-wrap gap-4">
            {monthsToShow.map((m) => {
                const formattedMonth = m.toFormat("yyyy-MM");

                if (!transactionsByMonth[formattedMonth]) {
                    return (
                        <div key={formattedMonth}>
                            Not found: {formattedMonth}
                        </div>
                    );
                }
                return (
                    <div
                        className="card border border-rounded"
                        key={formattedMonth}
                    >
                        <div className="card__header px-4 py-2 border-b border-gray-400 text-center font-bold">
                            {m.toFormat("LLL yyyy")}
                        </div>
                        <div className="card__body">
                            <div className="text-gray-600 pt-4 px-2">
                                {formatCurrency(
                                    transactionsByMonth[formattedMonth].incoming
                                )}
                            </div>
                            <div className="text-red-600 px-2">
                                {formatCurrency(
                                    transactionsByMonth[formattedMonth].outgoing
                                )}
                            </div>
                            <div
                                className={`pt-2 px-2 pb-4 font-semibold ${
                                    transactionsByMonth[formattedMonth].net > 0
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                }`}
                            >
                                {formatCurrency(
                                    transactionsByMonth[formattedMonth].net
                                )}
                            </div>
                            <div className="border-t border-gray-500 py-4 px-2">
                                <Link
                                    className="text-sky-600 hover:underline"
                                    href={`/dashboard/account/${account.id}/statement/${year}/${m.month}?year=${year}`}
                                >
                                    View Statement
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
