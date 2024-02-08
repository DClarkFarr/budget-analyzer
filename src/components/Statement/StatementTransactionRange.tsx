import { Transaction } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import { useMemo } from "react";

export default function StatementTransactionRange({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const transactionsByMonth = useMemo(() => {
    return Object.entries(
      transactions.reduce((acc, transaction) => {
        const monthYear = DateTime.fromISO(transaction.date).toFormat("MMM yy");
        if (!acc[monthYear]) {
          acc[monthYear] = {
            count: 0,
            label: monthYear,
            timestamp: DateTime.fromISO(transaction.date).toMillis(),
          };
        }
        acc[monthYear].count++;

        return acc;
      }, {} as Record<string, { count: number; label: string; timestamp: number }>)
    )
      .map(([, val]) => val)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions]);
  return (
    <div>
      <h3 className="text-lg">Transactions by Month</h3>
      <div className="months flex flex-wrap gap-2">
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
    </div>
  );
}
