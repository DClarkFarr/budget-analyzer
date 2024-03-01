import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getAccountUncategorizedTransactions } from "@/server/prisma/account/statement.methods";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        const accountId = parseInt(params.accountId);
        const yearString = req.nextUrl.searchParams.get("year") || undefined;

        const minDate = yearString
            ? DateTime.fromObject({ year: parseInt(yearString) })
            : undefined;

        const maxDate = minDate ? minDate.endOf("year") : undefined;

        try {
            const account = await getUserAccount(
                req.session.user.id,
                accountId
            );

            if (!account) {
                return NextResponse.json(
                    { message: "Account not found" },
                    { status: 400 }
                );
            }

            const transactions = await getAccountUncategorizedTransactions(
                accountId,
                {
                    minDate: minDate?.toISO() || undefined,
                    maxDate: maxDate?.toISO() || undefined,
                }
            );

            return NextResponse.json(transactions, { status: 200 });
        } catch (err) {
            console.warn("caughter fetching uncategorized", err);
            return NextResponse.json(
                { message: "Error fetching transactions" },
                { status: 400 }
            );
        }
    }
);
