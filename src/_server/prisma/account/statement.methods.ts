import { ProcessedTransaction, Transaction } from "@/types/Account/Transaction";
import { prisma } from "../index";
import toApiResponse from "@/server/methods/response/toApiResponse";
import { Category } from "@prisma/client";

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

export async function getAccountDuplicateTransactions(accountId: number) {
    const duplicatesGrouped = await prisma.$queryRawUnsafe<Transaction[]>(
        `
        SELECT 
          t.*,
          GROUP_CONCAT(ct.categoryId) as categoryIds,
          COUNT(*) as total
        FROM AccountTransaction t 
        JOIN (
          SELECT * FROM CategoryTransactions ct
          WHERE ct.ignoredAt IS NULL
        ) ct ON ct.transactionId = t.id
        WHERE t.accountId = ?
        GROUP BY t.id
        HAVING total > 1
    `,
        accountId
    );

    console.log(
        "got duplicates",
        duplicatesGrouped.length,
        duplicatesGrouped[0]
    );
    const transactions = await prisma.accountTransaction.findMany({
        where: {
            id: {
                in: duplicatesGrouped.map((t) => t.id),
            },
        },
        include: {
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });

    console.log("got transaction", transactions.length, transactions[0]);

    return transactions.map((t) => {
        return toApiResponse<Transaction & { category: Category }>(
            {
                ...t,
                category: t.categories.map((c) =>
                    toApiResponse<Category>(c.category, {
                        intKeys: ["id", "accountId", "userId"],
                        dateKeys: ["createdAt", "startAt", "endAt"],
                    })
                ),
            },
            {
                floatKeys: ["amount"],
            }
        );
    });
}
export async function getAccountUncategorizedTransactions(accountId: number) {
    const transactions = await prisma.$queryRawUnsafe<Transaction[]>(
        `
        SELECT t.* 
        FROM AccountTransaction t 
        WHERE t.accountId = ?
        AND NOT EXISTS(
          SELECT ct.id FROM CategoryTransactions ct 
          JOIN Category c ON c.id = ct.categoryId
          WHERE c.deletedAt IS NULL 
          AND ct.ignoredAt IS NULL
          AND ct.transactionId = t.id
        )
        GROUP BY t.id
      `,
        accountId
    );

    return transactions.map((t) =>
        toApiResponse(t, {
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
