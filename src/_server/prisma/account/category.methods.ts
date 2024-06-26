import { Category, CategoryFormState } from "@/types/Statement";
import { prisma } from "../client";
import UserError from "@/server/exceptions/UserException";
import { DateTime } from "luxon";
import toApiResponse from "@/server/methods/response/toApiResponse";
import { Category as PrimsaCategory } from "@prisma/client";

export function toCategoryResponse(from: PrimsaCategory) {
    return toApiResponse<Category>(from, {
        intKeys: ["id", "accountId", "userId"],
        dateKeys: ["startAt", "endAt", "createdAt"],
    });
}

export async function getCategories(
    accountId: number,
    options: { minDate?: string; maxDate?: string } = {}
) {
    const query = `
      SELECT c.*
      FROM Category c
      WHERE c.deletedAt IS NULL
      AND c.accountId = ?
      ${options.minDate ? "AND (c.startAt IS NULL OR c.startAt >= ?)" : ""}
      ${options.maxDate ? "AND (c.endAt IS NULL OR c.endAt <= ?)" : ""}
      ORDER BY c.name ASC
    `;
    const params: (string | number)[] = [accountId];
    if (options.minDate) {
        params.push(options.minDate);
    }
    if (options.maxDate) {
        params.push(options.maxDate);
    }

    const cats = await prisma.$queryRawUnsafe<PrimsaCategory[]>(
        query,
        ...params
    );

    return cats.map(toCategoryResponse);
}

export async function getCategory(categoryId: number) {
    const cat = await prisma.category.findFirst({
        where: { id: categoryId },
    });

    if (!cat) {
        return null;
    }
    return toCategoryResponse(cat);
}

export async function updateCategory(
    categoryId: number,
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

    const cat = await prisma.category.update({
        where: { id: categoryId },
        data: {
            name: data.name,
            type: data.type,
            startAt: data.startAt ? startAt.toISO() : null,
            endAt: data.endAt ? endAt.toISO() : null,
        },
    });

    return toCategoryResponse(cat);
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

    const cat = await prisma.category.create({
        data: {
            userId,
            accountId,
            name: data.name,
            type: data.type,
            startAt: data.startAt ? startAt.toISO() : null,
            endAt: data.endAt ? endAt.toISO() : null,
        },
    });

    return toCategoryResponse(cat);
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

    await prisma.category.update({
        where: { id: categoryId },
        data: { deletedAt: new Date() },
    });
}
