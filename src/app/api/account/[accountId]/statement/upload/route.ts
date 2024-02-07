import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  hasUserMiddleware,
  startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Upload a statement csv file
 */
export const POST = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req, { params }: { params: { accountId: string } }) => {
    return NextResponse.json(
      { message: "What upload?", accountId: params.accountId },
      { status: 200 }
    );
  }
);
