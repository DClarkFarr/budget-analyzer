import { AccountTransactionsTotal } from "@/types/Account/Transaction";
import { prisma } from "../prisma/client";

export async function getAccountTransactionTotals(
    userId: number,
    accountId: number
) {
    const totals: AccountTransactionsTotal = {
        count: 0,
        startAt: null,
        endAt: null,
    };

    const count = await prisma.accountTransaction.count({
        where: {
            accountId,
            userId,
        },
    });

    if (count) {
        totals.count = count;
    }

    const firstTransaction = await prisma.accountTransaction.findFirst({
        where: {
            accountId,
            userId,
        },
        orderBy: {
            date: "asc",
        },
    });

    if (firstTransaction) {
        totals.startAt = firstTransaction.date.toISOString();
    }

    const lastTransaction = await prisma.accountTransaction.findFirst({
        where: {
            accountId,
            userId,
        },
        orderBy: {
            date: "desc",
        },
    });

    if (lastTransaction) {
        totals.endAt = lastTransaction.date.toISOString();
    }

    return totals;
}
