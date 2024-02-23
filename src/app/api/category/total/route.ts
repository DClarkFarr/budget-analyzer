import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import {
  getCategoriesTotals,
  getCategoryTotals,
} from "@/server/queries/categoryTotals";
import { NextResponse, NextRequest } from "next/server";

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

      const totals = await getCategoriesTotals(
        req.session.user.id,
        categoryIds
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
