import UserError from "@/server/exceptions/UserException";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { isUserCategoryMiddleware } from "@/server/middleware/categoryMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import {
    deleteCategoryRule,
    syncCategoryRuleTransactions,
    updateCategoryRule,
} from "@/server/prisma/account/categoryRule.methods";
import { CategoryRuleFormState } from "@/types/Statement";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const PUT = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (req, res: { params: { categoryId: string; ruleId: string } }) => {
        const ruleId = parseInt(res.params.ruleId);
        try {
            const body = (await req.json()) as CategoryRuleFormState;
            const category = req.category;

            const rule = await updateCategoryRule(category.id, ruleId, body);

            await syncCategoryRuleTransactions(category);

            return NextResponse.json(rule);
        } catch (err) {
            if (err instanceof UserError) {
                return NextResponse.json(
                    { message: err.message },
                    { status: 400 }
                );
            }

            console.warn("error updating category rule", err);
            return NextResponse.json(
                { message: "Error Updating" },
                { status: 500 }
            );
        }
    }
);

export const DELETE = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (req, res: { params: { categoryId: string; ruleId: string } }) => {
        const ruleId = parseInt(res.params.ruleId);
        try {
            const category = req.category;

            await deleteCategoryRule(category.id, ruleId);

            await syncCategoryRuleTransactions(category);

            return NextResponse.json({ message: "Rule Deleted" });
        } catch (err) {
            console.warn("error deleting category rule", err);
            return NextResponse.json(
                { message: "Error Deleting" },
                { status: 500 }
            );
        }
    }
);
