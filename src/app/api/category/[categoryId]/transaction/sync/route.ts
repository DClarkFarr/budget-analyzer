import UserError from "@/server/exceptions/UserException";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { isUserCategoryMiddleware } from "@/server/middleware/categoryMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { syncCategoryRuleTransactions } from "@/server/prisma/account/categoryRule.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (req, { params }: { params: { categoryId: string } }) => {
        const category = req.category;

        try {
            await syncCategoryRuleTransactions(category);

            return NextResponse.json({ sync: "complete" });
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
