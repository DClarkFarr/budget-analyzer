import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { hasUserMiddleware } from "@/server/middleware/sessionMiddleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Upload a statement csv file
 */
export const POST = chainMiddleware([hasUserMiddleware()], async (req, res) => {
  return NextResponse.json({ message: "What upload?" }, { status: 200 });
});
