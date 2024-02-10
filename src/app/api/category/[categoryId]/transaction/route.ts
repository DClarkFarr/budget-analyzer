import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { isUserCategoryMiddleware } from "@/server/middleware/categoryMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getCategoryTransactions } from "@/server/prisma/account/categoryRule.methods";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET category transactions
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (req, { params }: { params: { categoryId: string } }) => {
        try {
            const transactions = await getCategoryTransactions(req.category.id);

            return NextResponse.json(transactions);
        } catch (err) {
            console.log("error fetching category transactions", err);
            return NextResponse.json(
                { message: "Error getting category transactions" },
                { status: 405 }
            );
        }
    }
);
