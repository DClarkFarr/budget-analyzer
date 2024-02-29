import { formatCurrency } from "@/methods/currency";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import { useMemo } from "react";

export default function TransactionsByMonth({
    startDate,
    endDate,
    transactions,
}: {
    startDate: string;
    endDate: string;
    transactions: WithCategories<Transaction>[];
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
                console.log("you are stupid");
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
            const isIgnored = t.categories.every((c) => c.type === "ignore");
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
                        <div className="card__body p-4">
                            <div className="text-emerald-600">
                                {formatCurrency(
                                    transactionsByMonth[formattedMonth].incoming
                                )}
                            </div>
                            <div className="text-red-600">
                                {formatCurrency(
                                    transactionsByMonth[formattedMonth].outgoing
                                )}
                            </div>
                            <div
                                className={`pt-4 font-semibold ${
                                    transactionsByMonth[formattedMonth].net > 0
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                }`}
                            >
                                {formatCurrency(
                                    transactionsByMonth[formattedMonth].net
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
