import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { isUserCategoryMiddleware } from "@/server/middleware/categoryMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import {
  getCategoryTransactions,
  moveTransactionToCategory,
} from "@/server/prisma/account/categoryRule.methods";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET category transactions
 */
export const GET = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
  async (req, { params }: { params: { categoryId: string } }) => {
    try {
      const transactions = await getCategoryTransactions(req.category.id);

      return NextResponse.json(transactions);
    } catch (err) {
      console.warn("error fetching category transactions", err);
      return NextResponse.json(
        { message: "Error getting category transactions" },
        { status: 400 }
      );
    }
  }
);

/**
 * Set category transaction pivot
 */
export const POST = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware(), isUserCategoryMiddleware()],
  async (req, res) => {
    const category = req.category;
    const body = (await req.json()) as { transactionId: number };
    if (!body.transactionId) {
      return NextResponse.json(
        { message: "Transaction ID required" },
        { status: 400 }
      );
    }

    try {
      await moveTransactionToCategory(category, body.transactionId);

      return NextResponse.json({
        message: "Transaction moved to category",
      });
    } catch (err) {
      console.warn("error setting category transaction pivot", err);
      return NextResponse.json(
        { message: "Moving transaction to category" },
        { status: 400 }
      );
    }
  }
);
