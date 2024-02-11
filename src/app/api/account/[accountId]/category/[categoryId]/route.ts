import UserError from "@/server/exceptions/UserException";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { isUserCategoryMiddleware } from "@/server/middleware/categoryMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import {
    deleteCategory,
    updateCategory,
} from "@/server/prisma/account/category.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Delete category endpoint
 */

export const DELETE = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (
        req,
        { params }: { params: { accountId: string; categoryId: string } }
    ) => {
        const accountId = parseInt(params.accountId);
        const categoryId = parseInt(params.categoryId);

        try {
            const account = await getUserAccount(
                req.session.user.id,
                accountId
            );
            if (!account) {
                return NextResponse.json(
                    { message: "Account not found" },
                    { status: 404 }
                );
            }

            await deleteCategory(accountId, categoryId);

            return NextResponse.json({ message: "Category deleted" });
        } catch (err) {
            console.warn("Error deleting category", err);
        }

        return NextResponse.json(
            { message: "An unknown error ocurred" },
            { status: 501 }
        );
    }
);

export const PUT = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
    async (
        req,
        { params }: { params: { categoryId: string; accountId: string } }
    ) => {
        try {
            const body = await req.json();
            const category = await updateCategory(req.category.id, body);

            return NextResponse.json(category);
        } catch (err) {
            if (err instanceof UserError) {
                return NextResponse.json(
                    { message: err.message },
                    { status: 400 }
                );
            }

            console.warn("Error updating category", err);
            return NextResponse.json(
                { message: "An unknown error ocurred" },
                { status: 501 }
            );
        }
    }
);
