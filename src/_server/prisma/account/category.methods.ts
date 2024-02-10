import { CategoryFormState } from "@/types/Statement";
import { prisma } from "../index";
import UserError from "@/server/exceptions/UserException";
import { DateTime } from "luxon";

export async function getCategories(accountId: number) {
    return prisma.category.findMany({
        where: { accountId, deletedAt: null },
        orderBy: { name: "asc" },
    });
}

export async function getCategory(accountId: number, categoryId: number) {
    return prisma.category.findFirst({
        where: { id: categoryId, accountId },
    });
}

export async function getUserCategory(userId: number, categoryId: number) {
    return prisma.category.findFirst({
        where: { id: categoryId, userId },
    });
}

export async function createCategory(
    userId: number,
    accountId: number,
    data: CategoryFormState
) {
    if (!data.name || data.name.length < 2) {
        throw new UserError("Category name must be at least 2 characters long");
    }

    if (!data.type || !["expense", "income", "ignore"].includes(data.type)) {
        throw new UserError(
            "Category type must be either 'expense' or 'income', or 'ignore'"
        );
    }

    const startAt = DateTime.fromSQL(data.startAt || "");
    const endAt = DateTime.fromSQL(data.endAt || "");

    if (data.startAt && !startAt.isValid) {
        throw new UserError("Invalid start date");
    }

    if (data.endAt && !endAt.isValid) {
        throw new UserError("Invalid end date");
    }

    return prisma.category.create({
        data: {
            userId,
            accountId,
            name: data.name,
            type: data.type,
            startAt: data.startAt ? startAt.toISO() : null,
            endAt: data.endAt ? endAt.toISO() : null,
        },
    });
}

/**
 * Delete category
 */
export async function deleteCategory(accountId: number, categoryId: number) {
    const category = await prisma.category.findFirst({
        where: { id: categoryId, accountId },
    });

    if (!category) {
        throw new UserError("Category not found");
    }

    return prisma.category.update({
        where: { id: categoryId },
        data: { deletedAt: new Date() },
    });
}
