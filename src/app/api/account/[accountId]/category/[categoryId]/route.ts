import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserAccount } from "@/server/prisma/account.methods";
import { deleteCategory } from "@/server/prisma/account/category.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Delete category endpoint
 */

export const DELETE = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (
    req,
    { params }: { params: { accountId: string; categoryId: string } }
  ) => {
    const accountId = parseInt(params.accountId);
    const categoryId = parseInt(params.categoryId);

    try {
      const account = await getUserAccount(req.session.user.id, accountId);
      if (!account) {
        return NextResponse.json(
          { message: "Account not found" },
          { status: 404 }
        );
      }

      await deleteCategory(accountId, categoryId);

      return NextResponse.json({ message: "Category deleted" });
    } catch (err) {
      console.warn("Error deleting category", err);
    }

    return NextResponse.json(
      { message: "An unknown error ocurred" },
      { status: 501 }
    );
  }
);
