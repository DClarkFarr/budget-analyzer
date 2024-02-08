import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getCategories } from "@/server/prisma/account/category.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get all account categories
 */
export const GET = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req, { params }: { params: { accountId: string } }) => {
    const accountId = parseInt(params.accountId);

    const account = await getUserAccount(req.session.user.id, accountId);
    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const categories = await getCategories(accountId);

    return NextResponse.json(categories);
  }
);
