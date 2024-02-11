import {
    Category,
    CategoryRule,
    CategoryRuleFormState,
} from "@/types/Statement";
import { prisma } from "../index";
import toApiResponse from "@/server/methods/response/toApiResponse";
import { getAccountTransactions } from "./statement.methods";
import { keyBy } from "lodash-es";
import UserError from "@/server/exceptions/UserException";
import { getCategory } from "./category.methods";

export async function getCategoryTransactions(categoryId: number) {
    const category = (await getCategory(categoryId))!;

    const res = await prisma.category.findFirst({
        where: {
            id: categoryId,
        },
        include: {
            transactions: {
                include: {
                    transaction: true,
                },
            },
        },
    });

    return (res?.transactions || [])
        .filter((p) => {
            if (
                category.startAt &&
                p.transaction.date < new Date(category.startAt)
            ) {
                return false;
            }

            if (
                category.endAt &&
                p.transaction.date > new Date(category.endAt)
            ) {
                return false;
            }

            return true;
        })
        .map((p) =>
            toApiResponse(p.transaction, {
                intKeys: ["id", "accountId", "userId"],
                dateKeys: ["date", "createdAt"],
                floatKeys: ["amount"],
            })
        );
}

export async function getCategoryTransactionPivots(categoryId: number) {
    return prisma.categoryTransactions.findMany({
        where: { categoryId },
    });
}

export async function syncCategoryRuleTransactions(category: Category) {
    const pivots = keyBy(
        await getCategoryTransactionPivots(category.id),
        "transactionId"
    );

    const rules = await getCategoryRules(category.id);

    const toAdd: number[] = [];
    const toRemove: number[] = [];

    (await getAccountTransactions(category.accountId)).forEach((t) => {
        const wasMatched = pivots[t.id] ? true : false;
        const wasIgnored = !pivots[t.id]?.ignoredAt;

        let isMatched = false;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (
                rule.transactionType &&
                rule.transactionType !== t.expenseType
            ) {
                isMatched = false;
            } else {
                const regExp = new RegExp(rule.rule, "i");

                if (regExp.test(t.description)) {
                    isMatched = true;
                    break;
                }
            }
        }

        if (wasMatched !== isMatched || (isMatched && wasIgnored)) {
            if (isMatched) {
                toAdd.push(t.id);
            } else {
                toRemove.push(t.id);
            }
        }
    });

    await prisma.categoryTransactions.deleteMany({
        where: {
            transactionId: {
                in: toRemove,
            },
            categoryId: category.id,
        },
    });

    await Promise.all(
        toAdd.map((transactionId) => {
            return prisma.categoryTransactions.upsert({
                where: {
                    category_transaction: {
                        categoryId: category.id,
                        transactionId,
                    },
                },
                update: {
                    ignoredAt: null,
                },
                create: {
                    categoryId: category.id,
                    transactionId,
                    ignoredAt: null,
                },
            });
        })
    );

    return [toAdd, toRemove];
}

export async function createCategoryRule(
    category: Category,
    data: CategoryRuleFormState
) {
    if (!data.name || data.name.length < 2) {
        throw new UserError("Category rule name must be at least 2 chars");
    }

    if (!data.rule || data.rule.length < 2) {
        throw new UserError("Category rule must be at least 2 chars");
    }

    const rule = await prisma.categoryRule.create({
        data: {
            userId: category.userId,
            categoryId: category.id,
            name: data.name,
            transactionType: data.transactionType || null,
            rule: data.rule,
        },
    });

    return toApiResponse<CategoryRule>(rule, {
        intKeys: ["id", "userId", "categoryId"],
        dateKeys: ["createdAt"],
    });
}

export async function updateCategoryRule(
    categoryId: number,
    id: number,
    data: CategoryRuleFormState
) {
    if (!data.name || data.name.length < 2) {
        throw new UserError("Category rule name must be at least 2 chars");
    }

    if (!data.rule || data.rule.length < 2) {
        throw new UserError("Category rule must be at least 2 chars");
    }

    const rule = await prisma.categoryRule.update({
        where: {
            id,
            categoryId,
        },
        data: {
            name: data.name,
            transactionType: data.transactionType || null,
            rule: data.rule,
        },
    });

    return toApiResponse<CategoryRule>(rule, {
        intKeys: ["id", "userId", "categoryId"],
        dateKeys: ["createdAt"],
    });
}

export async function deleteCategoryRule(categoryId: number, id: number) {
    await prisma.categoryRule.delete({
        where: {
            id,
            categoryId,
        },
    });
}

export async function getCategoryRules(categoryId: number) {
    return (
        await prisma.categoryRule.findMany({
            where: { categoryId },
        })
    ).map((r) =>
        toApiResponse<CategoryRule>(r, {
            intKeys: ["id", "categoryId", "userId"],
            dateKeys: ["createdAt"],
        })
    );
}
