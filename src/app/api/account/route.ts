import chainMiddleware from "@/server/methods/router/chainMiddleware";
import { hasUserMiddleware } from "@/server/middleware/sessionMiddleware";
import { NextResponse } from "next/server";

export const POST = chainMiddleware([hasUserMiddleware()], async (req, res) => {
  return NextResponse.json({ message: "Account created" });
});
