import UserError from "@/server/exceptions/UserException";
import { AccountFormState } from "@/types/Account";
import { prisma } from "./client";
import { Account } from "@prisma/client";

export async function getUserAccounts(userId: number) {
    return prisma.account.findMany({
        where: { userId },
        orderBy: { name: "asc" },
    });
}

export async function getUserAccount(userId: number, accountId: number) {
    return prisma.account.findFirst({ where: { id: accountId, userId } });
}

export async function createAccount(userId: number, data: AccountFormState) {
    if (!data.name || data.name.length < 3) {
        throw new UserError("Name is required");
    }
    if (!data.color) {
        throw new UserError("Color is required");
    }
    if (!(data.color.startsWith("#") && data.color.length === 7)) {
        throw new UserError("Invalid color. Use format #000000");
    }

    const existing = await prisma.account.findFirst({
        where: { name: data.name, userId },
    });

    if (existing) {
        throw new UserError("Account with this name already exists");
    }

    const created = await prisma.account.create({
        data: {
            userId,
            ...data,
        },
    });

    return created as Account;
}
