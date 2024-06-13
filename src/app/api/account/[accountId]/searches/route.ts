import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getAccountSearches } from "@/server/prisma/account/searches.methods";
import { NextResponse } from "next/server";

/**
 * Get account searches
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { accountId: string } }) => {
        try {
            const searches = getAccountSearches(parseInt(params.accountId, 10));

            return NextResponse.json(searches);
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
