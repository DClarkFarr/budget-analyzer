import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import TransactionsByMonth from "./TransactionsByMonth";
import { Account } from "@/types/Account";
import TransactionsByCategory from "./TransactionTotalsByCategory";

export default function StatementTransactionRange({
    transactions,
    account,
    year,
}: {
    transactions: WithCategories<Transaction>[];
    account: Account;
    year: number;
}) {
    const transactionsByMonth = useMemo(() => {
        return Object.entries(
            transactions.reduce((acc, transaction) => {
                const monthYear = DateTime.fromISO(transaction.date).toFormat(
                    "MMM yy"
                );
                if (!acc[monthYear]) {
                    acc[monthYear] = {
                        count: 0,
                        label: monthYear,
                        timestamp: DateTime.fromISO(
                            transaction.date
                        ).toMillis(),
                    };
                }
                acc[monthYear].count++;

                return acc;
            }, {} as Record<string, { count: number; label: string; timestamp: number }>)
        )
            .map(([, val]) => val)
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [transactions]);

    const [dates, setDates] = useState<{ start: string; end: string }>({
        start: "",
        end: "",
    });

    useEffect(() => {
        const firstDate = Math.min(
            ...transactions.map((t) => DateTime.fromISO(t.date).toMillis())
        );
        const lastDate = Math.max(
            ...transactions.map((t) => DateTime.fromISO(t.date).toMillis())
        );

        setDates({
            start: DateTime.fromMillis(firstDate).toFormat("yyyy-MM-dd"),
            end: DateTime.fromMillis(lastDate).toFormat("yyyy-MM-dd"),
        });
    }, [transactions]);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">
                Transactions by Month
            </h3>
            <div className="months flex flex-wrap gap-2 mb-8">
                {transactionsByMonth.map((month) => (
                    <div
                        key={month.timestamp}
                        className="month px-2 py-1 bg-gray-100 rounded text-center flex gap-x-1"
                    >
                        <div className="month__label">{month.label}</div>
                        <div>
                            <div className="month__count font-bold p-1 text-xs leading-none bg-sky-700 text-white rounded-full">
                                {month.count}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-semibold mb-2">Totals by Month</h3>

            <TransactionsByMonth
                startDate={dates.start}
                endDate={dates.end}
                transactions={transactions}
                account={account}
                year={year}
            />

            <h3 className="text-lg font-semibold mb-2 mt-8">
                Yearly Category Totals
            </h3>

            <TransactionsByCategory
                transactions={transactions}
                account={account}
                year={year}
            />
        </div>
    );
}
