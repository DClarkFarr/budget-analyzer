import UserError from "@/server/exceptions/UserException";
import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
  startSessionMiddleware,
  hasUserMiddleware,
} from "@/server/middleware/sessionMiddleware";
import {
  createAccount,
  getUserAccounts,
} from "@/server/prisma/account.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get all accounts for the user
 */
export const GET = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req) => {
    try {
      const accounts = await getUserAccounts(req.session.user.id);

      return NextResponse.json(accounts);
    } catch (err) {
      if (err instanceof Error) {
        console.log("caught error creating account", err);

        return NextResponse.json(
          { message: "An error occurred", error: err?.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
);

/**
 * Create a new account for the user
 */
export const POST = chainMiddleware(
  [startSessionMiddleware(), hasUserMiddleware()],
  async (req) => {
    try {
      const { name, color } = await req.json();

      const account = await createAccount(req.session.user.id, { name, color });

      return NextResponse.json(account);
    } catch (err) {
      if (err instanceof UserError) {
        return NextResponse.json({ message: err.message }, { status: 400 });
      }
      if (err instanceof Error) {
        console.log("caught error creating account", err);

        return NextResponse.json(
          { message: "An error occurred", error: err?.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
);
