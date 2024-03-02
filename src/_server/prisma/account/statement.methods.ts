import { ProcessedTransaction, Transaction } from "@/types/Account/Transaction";
import { prisma } from "../client";
import toApiResponse from "@/server/methods/response/toApiResponse";
import {
    Category as PrismaCategory,
    CategoryTransactions,
} from "@prisma/client";
import {
    getCategoryRules,
    ruleMatchesTransaction,
} from "./categoryRule.methods";
import { Category } from "@/types/Statement";

export async function getAccountTransactions<
    IC extends boolean,
    WC extends boolean
>(
    accountId: number,
    options: {
        includeCategoryPivots?: IC;
        withCategories?: WC;
        minDate?: string;
        maxDate?: string;
    } = {}
) {
    type TransactionWithCategories = Transaction & {
        categories: (CategoryTransactions & { category: PrismaCategory[] })[];
    };

    type Response = WC extends true
        ? TransactionWithCategories
        : IC extends true
        ? Transaction & { categories: CategoryTransactions[] }
        : Transaction;

    const records = (await prisma.accountTransaction.findMany({
        where: {
            accountId,
            date: {
                gte: options.minDate,
                lte: options.maxDate,
            },
        },
        include: {
            categories: !!options?.withCategories
                ? { include: { category: true }, where: { ignoredAt: null } }
                : !!options?.includeCategoryPivots,
        },
        orderBy: { date: "desc" },
    })) as unknown as Response[];

    return records
        .map((t) => {
            if (options.withCategories) {
                const item = t as TransactionWithCategories;

                return {
                    ...t,
                    categories: item.categories.map((c) => c.category),
                };
            }
            return t;
        })
        .map((t) =>
            toApiResponse<Response>(t, {
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

    return transactions.map((t) => {
        return toApiResponse<Transaction & { categories: PrismaCategory[] }>(
            {
                ...t,
                categories: t.categories.map((c) =>
                    toApiResponse<PrismaCategory>(c.category, {
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

export function smartSortCategoriesForTransaction(
    transaction: Transaction,
    categories: Category[]
) {
    const cs = [...categories];
    const typeMap = {
        income: "incoming",
        expense: "outgoing",
    };
    cs.sort((a, b) => {
        if (a.type !== b.type) {
            if (a.type === "ignore") {
                return 1;
            }
            if (b.type === "ignore") {
                return -1;
            }

            return transaction.expenseType === typeMap[a.type] ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
    });

    return cs;
}

export async function mapCategoriesToTransactions(
    transactions: Transaction[],
    categories: Category[]
) {
    const categoriesWithRules = await Promise.all(
        categories.map(async (c) => {
            const rules = await getCategoryRules(c.id);

            return { ...c, rules };
        })
    );

    return transactions.map((t) => {
        const matched = categoriesWithRules
            .filter((c) => {
                return c.rules.some((r) => {
                    return ruleMatchesTransaction(r, t);
                });
            })
            .map(({ rules, ...c }) => {
                return c;
            });

        return {
            ...t,
            categories: smartSortCategoriesForTransaction(t, matched),
        };
    });
}

export async function getAccountUncategorizedTransactions(
    accountId: number,
    options: { maxDate?: string; minDate?: string } = {}
) {
    const params: (string | number)[] = [accountId];

    if (options.minDate) {
        params.push(options.minDate);
    }
    if (options.maxDate) {
        params.push(options.maxDate);
    }

    const transactions = await prisma.$queryRawUnsafe<Transaction[]>(
        `
        SELECT t.* 
        FROM AccountTransaction t 
        WHERE t.accountId = ?
        ${options.minDate ? "AND t.date >= ?" : ""}
        ${options.maxDate ? "AND t.date <= ?" : ""}
        AND NOT EXISTS(
          SELECT ct.id FROM CategoryTransactions ct 
          JOIN Category c ON c.id = ct.categoryId
          WHERE c.deletedAt IS NULL 
          AND ct.ignoredAt IS NULL
          AND ct.transactionId = t.id
        )
        GROUP BY t.id
      `,
        ...params
    );

    return transactions.map((t) =>
        toApiResponse<Transaction>(t, {
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
