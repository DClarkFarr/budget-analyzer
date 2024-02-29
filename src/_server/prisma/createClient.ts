import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query",
        },
    ],
});

prismaClient.$on("query", async (e) => {
    // console.log(`Logging Query: ${e.query} ${e.params}`);
});

console.log("creating prisma client");

export { prismaClient };
