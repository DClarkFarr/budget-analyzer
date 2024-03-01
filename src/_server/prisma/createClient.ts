import { PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

let prismaClient = null as unknown as PrismaClient<
    {
        log: {
            emit: "event";
            level: "query";
        }[];
    },
    "query",
    DefaultArgs
>;

if (!prismaClient) {
    const pc = new PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
        ],
    });
    pc.$on("query", async (e) => {
        // console.log(`Logging Query: ${e.query} ${e.params}`);
    });

    prismaClient = pc;
}

console.log("exporting prisma client");

export { prismaClient };
