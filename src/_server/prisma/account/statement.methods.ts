import { ProcessedTransaction, Transaction } from "@/types/Account/Transaction";
import { prisma } from "../index";
import toApiResponse from "@/server/methods/response/toApiResponse";

export async function getAccountTransactions(accountId: number) {
    const records =
        (await prisma.accountTransaction.findMany({
            where: { accountId },
            orderBy: { date: "desc" },
        })) || [];

    return records.map((t) =>
        toApiResponse<Transaction>(t, {
            intKeys: ["id", "accountId", "userId"],
            dateKeys: ["createdAt", "date"],
            floatKeys: ["amount"],
        })
    );
}

export async function insertTransaction(
    userId: number,
    accountId: number,
    transaction: ProcessedTransaction
) {
    const existing = await prisma.accountTransaction.findFirst({
        where: {
            accountId,
            userId,
            hash: transaction.hash,
        },
    });

    if (existing) {
        return false;
    }

    const created = await prisma.accountTransaction.create({
        data: {
            accountId,
            userId,
            ...transaction,
        },
    });

    return created;
}
