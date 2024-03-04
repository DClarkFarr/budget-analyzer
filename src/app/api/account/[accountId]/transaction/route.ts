import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getAccountTransactions } from "@/server/prisma/account/statement.methods";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        try {
            const user = req.session.user;
            const accountId = parseInt(params.accountId);
            const yearString = req.nextUrl.searchParams.get("year");
            const year = yearString ? parseInt(yearString) : undefined;
            const account = await getUserAccount(user.id, accountId);

            if (!account) {
                return NextResponse.json(
                    { message: "Account not found" },
                    { status: 404 }
                );
            }

            const withCategories =
                req.nextUrl.searchParams.get("withCategories") === "true";

            const minDate = year
                ? DateTime.fromObject({ year, month: 1, day: 1 })
                : undefined;

            const maxDate = minDate ? minDate.endOf("year") : undefined;

            const transactions = await getAccountTransactions(accountId, {
                withCategories,
                minDate: minDate?.toISO() || undefined,
                maxDate: maxDate?.toISO() || undefined,
            });

            return NextResponse.json(transactions);
        } catch (err) {
            if (err instanceof Error) {
                console.warn("caught error getting account", err);
                return NextResponse.json(
                    { message: "An error occurred", error: err?.message },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
);
