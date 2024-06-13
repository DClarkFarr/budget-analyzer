import {
    AccountSearchRaw,
    AccountSearchSerialized,
} from "@/types/Account/Searches";
import { prisma } from "../client";
import { AccountSearch as AccountSearchDb } from "@prisma/client";

function mapRawToSerialized(search: AccountSearchDb): AccountSearchSerialized {
    return {
        ...search,
        content: JSON.parse(search.content),
        excludeIds: JSON.parse(search.excludeIds || "") || [],
        createdAt: search.createdAt.toISOString(),
        startAt: search.startAt?.toISOString() || null,
        endAt: search.endAt?.toISOString() || null,
    };
}
export async function getAccountSearches(accountId: number) {
    const rows = await prisma.accountSearch.findMany({
        where: {
            accountId,
        },
        orderBy: { createdAt: "asc" },
    });

    return rows.map(mapRawToSerialized);
}

export async function createAccountSearch(
    accountId: number,
    userId: number,
    name: string,
    content: string | any[] = []
) {
    const created = await prisma.accountSearch.create({
        data: {
            accountId,
            userId,
            name,
            content:
                typeof content === "string" ? content : JSON.stringify(content),
        },
    });

    return mapRawToSerialized(created);
}

export async function updateAccountSearch(
    accountId: number,
    searchId: number,
    data: Partial<
        Pick<
            AccountSearchSerialized,
            "startAt" | "endAt" | "content" | "excludeIds"
        >
    >
) {
    const updated = await prisma.accountSearch.update({
        where: {
            id: searchId,
            accountId: accountId,
        },
        data: {
            ...data,
            content: JSON.stringify(data.content),
            excludeIds: JSON.stringify(data.excludeIds || []),
        },
    });

    return mapRawToSerialized(updated);
}
