import chainMiddleware from "@/server/methods/router/chainMiddleware";
import {
    hasUserMiddleware,
    startSessionMiddleware,
} from "@/server/middleware/sessionMiddleware";
import { getUserCategories } from "@/server/prisma/user.methods";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = chainMiddleware(
    [startSessionMiddleware(), hasUserMiddleware()],
    async (req) => {
        try {
            const categories = await getUserCategories(req.session.user.id);

            return NextResponse.json(categories);
        } catch (err) {
            console.warn("error creating category rule", err);
            return NextResponse.json(
                { message: "Error creating category rule" },
                { status: 400 }
            );
        }
    }
);
