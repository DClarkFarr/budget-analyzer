import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import {
    getUserAccount,
    getUserAccounts,
} from "@/server/prisma/account.methods";
import { getAccountTransactionTotals } from "@/server/queries/transactionStats";
import { AccountTransactionsTotal } from "@/types/Account/Transaction";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get stats for an account
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        try {
            const user = req.session.user;
            const accountId = parseInt(params.accountId, 10);

            const account = await getUserAccount(user.id, accountId);

            if (!account) {
                return NextResponse.json(
                    {
                        message: "Account not found",
                    },
                    { status: 404 }
                );
            }

            const stats = await getAccountTransactionTotals(user.id, accountId);

            return NextResponse.json(stats);
        } catch (err) {
            console.warn("Caught error getting accounts stats", err);

            return NextResponse.json({
                message: "An error occurred getting accounts stats",
            });
        }
    }
);
