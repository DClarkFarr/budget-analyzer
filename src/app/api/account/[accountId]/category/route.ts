import UserError from "@/server/exceptions/UserException";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import {
    createCategory,
    getCategories,
} from "@/server/prisma/account/category.methods";
import { CategoryFormState } from "@/types/Statement";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get all account categories
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        const accountId = parseInt(params.accountId);

        const account = await getUserAccount(req.session.user.id, accountId);
        if (!account) {
            return NextResponse.json(
                { message: "Account not found" },
                { status: 404 }
            );
        }

        const yearString = req.nextUrl.searchParams.get("year") || undefined;
        const minDate = yearString
            ? DateTime.fromObject({
                  year: parseInt(yearString),
                  month: 1,
                  day: 1,
              })
            : undefined;
        const maxDate = minDate ? minDate.endOf("year") : undefined;

        const categories = await getCategories(accountId, {
            minDate: minDate?.toISO() || undefined,
            maxDate: maxDate?.toISO() || undefined,
        });

        return NextResponse.json(categories);
    }
);

/**
 * Create category
 */
export const POST = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        const userId = req.session.user.id;
        const accountId = parseInt(params.accountId);

        try {
            const body = (await req.json()) as CategoryFormState;
            const category = await createCategory(userId, accountId, body);

            return NextResponse.json(category);
        } catch (err) {
            if (err instanceof UserError) {
                return NextResponse.json(
                    { message: err.message },
                    { status: 400 }
                );
            }

            console.warn("Error creating category", err);
        }

        return NextResponse.json(
            { message: "Error creating category" },
            { status: 500 }
        );
    }
);
