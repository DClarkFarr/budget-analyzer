import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import { getAccountTransactions } from "@/server/prisma/account/statement.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req, { params }: { params: { accountId: string } }) => {
    try {
      const user = req.session.user;
      const accountId = parseInt(params.accountId);
      const account = await getUserAccount(user.id, accountId);

      if (!account) {
        return NextResponse.json(
          { message: "Account not found" },
          { status: 404 }
        );
      }

      const transactions = await getAccountTransactions(accountId);

      return NextResponse.json(transactions);
    } catch (err) {
      if (err instanceof Error) {
        console.log("caught error getting account", err);
        return NextResponse.json(
          { message: "An error occurred", error: err?.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
);
