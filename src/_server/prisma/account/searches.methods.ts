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
