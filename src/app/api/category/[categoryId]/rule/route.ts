import UserError from "@/server/exceptions/UserException";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { isUserCategoryMiddleware } from "@/server/middleware/categoryMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import {
    createCategoryRule,
    getCategoryRules,
    syncCategoryRuleTransactions,
} from "@/server/prisma/account/categoryRule.methods";
import { CategoryRuleFormState } from "@/types/Statement";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (req, { params }: { params: { categoryId: string } }) => {
        const category = req.category;

        try {
            const body = (await req.json()) as CategoryRuleFormState;

            const rule = await createCategoryRule(category, body);

            await syncCategoryRuleTransactions(category, rule);

            return NextResponse.json(rule);
        } catch (err) {
            if (err instanceof UserError) {
                return NextResponse.json(
                    { message: err.message },
                    { status: 400 }
                );
            }

            console.warn("error creating category rule", err);
            return NextResponse.json("Error Creating", { status: 500 });
        }
    }
);

export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (req) => {
        try {
            const rules = await getCategoryRules(req.category.id);

            rules.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            return NextResponse.json(rules);
        } catch (err) {
            console.warn("error creating category rule", err);
            return NextResponse.json(
                { message: "Error creating category rule" },
                { status: 400 }
            );
        }
    }
);
