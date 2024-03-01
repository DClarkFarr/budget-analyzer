import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getCategoriesTotals } from "@/server/queries/categoryTotals";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req) => {
        try {
            const categoryIds =
                req.nextUrl?.searchParams
                    ?.get("categoryIds")
                    ?.split(",")
                    ?.map(Number) || [];

            const year = req.nextUrl?.searchParams?.get("year")
                ? parseInt(req.nextUrl.searchParams?.get("year")!)
                : undefined;

            const minDate = year
                ? DateTime.fromObject({ year, month: 1, day: 1 }).toISO() ||
                  undefined
                : undefined;

            const maxDate = year
                ? DateTime.fromObject({ year, month: 12, day: 31 }).toISO() ||
                  undefined
                : undefined;

            const totals = await getCategoriesTotals(
                req.session.user.id,
                categoryIds,
                {
                    minDate,
                    maxDate,
                }
            );

            return NextResponse.json(totals);
        } catch (err) {
            console.warn("error calculating categories totals", err);

            return NextResponse.json(
                { message: "Error calculating categories totals" },
                { status: 500 }
            );
        }
    }
);
