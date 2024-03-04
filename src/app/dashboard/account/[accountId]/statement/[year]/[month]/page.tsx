import MonthlyStatement from "@/components/Statement/MonthlyStatement";
import { getAccountTransactions } from "@/server/prisma/account/statement.methods";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { Category, CategoryTypes } from "@/types/Statement";
import { DateTime } from "luxon";
import { useMemo } from "react";

export default async function MonthlyStatementPage({
    params: { accountId, year, month },
}: {
    params: { accountId: string; year: string; month: string };
}) {
    const minDate = DateTime.fromObject({
        year: parseInt(year),
        month: parseInt(month),
        day: 1,
    });
    const maxDate = minDate.endOf("month");

    const transactions = (await getAccountTransactions(parseInt(accountId), {
        withCategories: true,
        minDate: minDate.toISO()!,
        maxDate: maxDate.toISO()!,
    })) as unknown as WithCategories<Transaction>[];

    return (
        <div className="statement--page">
            <MonthlyStatement
                accountId={parseInt(accountId)}
                year={parseInt(year)}
                month={parseInt(month)}
                transactions={transactions}
            />
        </div>
    );
}
