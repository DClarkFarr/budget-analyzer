import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { updateSearch, querySearch } from "@/server/prisma/searches.methods";
import { SearchSerialized } from "@/types/Searches";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Query search
 */
export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { searchId: string } }) => {
        try {
            const transactions = await querySearch(
                req.session.user.id,
                parseInt(params.searchId)
            );

            return NextResponse.json(transactions);
        } catch (err) {
            if (err instanceof Error) {
                console.warn("caught error getting account", err);
                return NextResponse.json(
                    { message: err?.message },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
);

/**
 * Update search
 */
export const PUT = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req, { params }: { params: { searchId: string } }) => {
        const body = (await req.json()) as {
            startAt?: string;
            endAt?: string;
            content?: SearchSerialized["content"];
            excludeIds?: SearchSerialized["excludeIds"];
        };

        try {
            let toSet: Partial<SearchSerialized> = {};

            if (body.startAt && DateTime.fromSQL(body.startAt).isValid) {
                return NextResponse.json(
                    { message: "Invalid start date" },
                    { status: 400 }
                );
            }

            if (body.endAt && DateTime.fromSQL(body.endAt).isValid) {
                return NextResponse.json(
                    { message: "Invalid end date" },
                    { status: 400 }
                );
            }

            if (body.startAt) {
                toSet.startAt = body.startAt;
            }
            if (body.endAt) {
                toSet.endAt = body.endAt;
            }
            if (body.content) {
                toSet.content = body.content;
            }
            if (body.excludeIds) {
                toSet.excludeIds = body.excludeIds;
            }

            const updated = await updateSearch(
                req.session.user.id,
                parseInt(params.searchId, 10),
                toSet
            );

            return NextResponse.json(updated);
        } catch (err) {
            if (err instanceof Error) {
                console.warn("caught error updatting search", err);
                return NextResponse.json(
                    { message: err?.message || "Failed to save search" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
);
