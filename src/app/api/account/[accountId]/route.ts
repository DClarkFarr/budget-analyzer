import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get an account for the user
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        try {
            const user = req.session.user;
            const account = await getUserAccount(
                user.id,
                parseInt(params.accountId)
            );

            return NextResponse.json(account);
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
