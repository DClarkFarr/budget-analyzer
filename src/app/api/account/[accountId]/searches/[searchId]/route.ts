import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { updateAccountSearch } from "@/server/prisma/account/searches.methods";
import { AccountSearchSerialized } from "@/types/Account/Searches";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const PUT = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (
        req,
        { params }: { params: { accountId: string; searchId: string } }
    ) => {
        const body = (await req.json()) as {
            startAt?: string;
            endAt?: string;
            content?: AccountSearchSerialized["content"];
            excludeIds?: AccountSearchSerialized["excludeIds"];
        };

        try {
            let toSet: Partial<AccountSearchSerialized> = {};

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

            const updated = await updateAccountSearch(
                parseInt(params.accountId, 10),
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
