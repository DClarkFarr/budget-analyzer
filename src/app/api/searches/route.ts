import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { createSearch, getSearches } from "@/server/prisma/searches.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get account searches
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req) => {
        try {
            const searches = await getSearches(req.session.user.id);

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

/**
 * Create a new search
 */
export const POST = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req) => {
        const body = (await req.json()) as { name?: string };

        try {
            if (!body.name || body.name.length < 3) {
                return NextResponse.json(
                    { message: "Search must be at least 3 characters" },
                    { status: 400 }
                );
            }

            const search = await createSearch(req.session.user.id, body.name);

            return NextResponse.json(search);
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
