import { AccountSearchSerialized } from "@/types/Account/Searches";
import { prisma } from "../client";

export async function getAccountSearches(accountId: number) {
    const rows = await prisma.accountSearch.findMany({
        where: {
            accountId,
        },
        orderBy: { createdAt: "asc" },
    });

    return rows.map(
        (row) =>
            ({
                ...row,
                content: JSON.parse(row.content),
                createdAt: row.createdAt.toISOString(),
            } as AccountSearchSerialized)
    );
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

    return {
        ...created,
        content: JSON.parse(created.content),
        createdAt: created.createdAt.toISOString(),
    } as AccountSearchSerialized;
}
