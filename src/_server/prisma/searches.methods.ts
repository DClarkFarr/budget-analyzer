import {
    SearchContentItem,
    SearchRaw,
    SearchSerialized,
} from "@/types/Searches";
import { prisma } from "./client";
import { Search as SearchDb, AccountTransaction } from "@prisma/client";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import {
    AccountTransaction as PrismaTransaction,
    Category as PrismaCategory,
} from "@prisma/client";
import toApiResponse from "@/server/methods/response/toApiResponse";
import { Category } from "@/types/Statement";

function mapRawToSerialized(search: SearchDb): SearchSerialized {
    return {
        ...search,
        content: JSON.parse(search.content),
        excludeIds: JSON.parse(search.excludeIds || "") || [],
        createdAt: search.createdAt.toISOString(),
        startAt: search.startAt?.toISOString() || null,
        endAt: search.endAt?.toISOString() || null,
    };
}
export async function getSearches(userId: number) {
    const rows = await prisma.search.findMany({
        where: {
            userId,
        },
        orderBy: { createdAt: "asc" },
    });

    return rows.map(mapRawToSerialized);
}

export async function createSearch(
    userId: number,
    name: string,
    content: string | any[] = []
) {
    const created = await prisma.search.create({
        data: {
            userId,
            name,
            content:
                typeof content === "string" ? content : JSON.stringify(content),
        },
    });

    return mapRawToSerialized(created);
}

export async function updateSearch(
    userId: number,
    searchId: number,
    data: Partial<
        Pick<SearchSerialized, "startAt" | "endAt" | "content" | "excludeIds">
    >
) {
    const updated = await prisma.search.update({
        where: {
            id: searchId,
            userId,
        },
        data: {
            ...data,
            content: data.content ? JSON.stringify(data.content) : undefined,
            excludeIds: data.excludeIds
                ? JSON.stringify(data.excludeIds || [])
                : undefined,
        },
    });

    return mapRawToSerialized(updated);
}

function mapTransaction(
    t: PrismaTransaction & {
        categories: { category: PrismaCategory }[];
    }
) {
    return toApiResponse<Transaction & { categories: Category[] }>(
        {
            ...t,
            categories: t.categories.map((c) =>
                toApiResponse(c.category, {
                    intKeys: ["id", "accountId", "userId"],
                    dateKeys: ["createdAt", "startAt", "endAt"],
                })
            ),
        },
        {
            floatKeys: ["amount"],
        }
    );
}

export async function querySearch(userId: number, searchId: number) {
    const searchRaw = await prisma.search.findFirst({
        where: {
            id: searchId,
            userId,
        },
    });

    if (!searchRaw) {
        throw new Error("Search not found");
    }

    const search = mapRawToSerialized(searchRaw);

    const validFilters = search.content
        .map((v, i) => {
            if (Array.isArray(v)) {
                throw new Error("Group filters not supported");
            }

            return { ...v, filterIndex: i };
        })
        .filter((filterOrGroup) => {
            if (Array.isArray(filterOrGroup)) {
                throw new Error("Group filters not supported");
            }

            return !!filterOrGroup.value;
        });

    const transactions = new Map<
        Number,
        WithCategories<Transaction & { foundbyFilters: number[] }>
    >();

    for (let i = 0; i < validFilters.length; i++) {
        const filter = validFilters[i];

        if (filter.type === "category") {
            const foundTransactions = await prisma.accountTransaction.findMany({
                where: {
                    userId,
                    date: {
                        gte: search.startAt || undefined,
                        lte: search.endAt || undefined,
                    },
                    categories: {
                        some: {
                            categoryId: parseInt(filter.value),
                        },
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

            foundTransactions.forEach((t) => {
                const parsed = mapTransaction(t);
                if (transactions.has(t.id)) {
                    const existing = transactions.get(t.id)!;
                    existing.categories.push(...parsed.categories);
                    existing.foundbyFilters.push(filter.filterIndex);
                } else {
                    transactions.set(t.id, {
                        ...parsed,
                        foundbyFilters: [filter.filterIndex],
                    });
                }
            });
        } else if (filter.type === "text") {
            const query = `
              SELECT t.*
              FROM AccountTransaction t
              WHERE t.userId = ?
              AND (
                t.description LIKE ?
                OR t.description REGEXP ?
              )
              ${search.startAt ? "AND (t.date >= ?)" : ""}
              ${search.endAt ? "AND (t.date <= ?)" : ""}
          `;
            const params: (string | number)[] = [
                userId,
                `%${filter.value}%`,
                filter.value,
            ];
            if (search.startAt) {
                params.push(search.startAt);
            }
            if (search.endAt) {
                params.push(search.endAt);
            }

            const foundTransactions = await prisma.$queryRawUnsafe<
                PrismaTransaction[]
            >(query, ...params);

            foundTransactions.forEach((t) => {
                const parsed = mapTransaction({ ...t, categories: [] });
                if (transactions.has(t.id)) {
                    const existing = transactions.get(t.id)!;
                    existing.foundbyFilters.push(filter.filterIndex);
                } else {
                    transactions.set(t.id, {
                        ...parsed,
                        foundbyFilters: [filter.filterIndex],
                    });
                }
            });
        }
    }

    const toReturn = Array.from(transactions.values()).sort((a, b) => {
        if (a.date === b.date) {
            return a.id - b.id;
        }

        return a.date < b.date ? 1 : -1;
    });

    return toReturn;
}
