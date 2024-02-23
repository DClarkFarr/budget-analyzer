import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccounts } from "@/server/prisma/account.methods";
import { getAccountTransactionTotals } from "@/server/queries/transactionStats";
import { AccountTransactionsTotal } from "@/types/Account/Transaction";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get stats for all user accounts
 */
export const GET = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req, res) => {
    try {
      const user = req.session.user;

      const accounts = await getUserAccounts(user.id);

      const statsByAccount: Record<number, AccountTransactionsTotal> = {};

      await Promise.all(
        accounts.map(async (account) => {
          statsByAccount[account.id] = await getAccountTransactionTotals(
            user.id,
            account.id
          );
        })
      );

      return NextResponse.json(statsByAccount);
    } catch (err) {
      console.warn("Caught error getting accounts stats", err);

      return NextResponse.json({
        message: "An error occurred getting accounts stats",
      });
    }
  }
);
