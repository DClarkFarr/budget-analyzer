import { PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

const prismaClientSingleton = () => {
    console.log("creating prisma client");
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

    return pc;
};

declare global {
    var prismaClient: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prismaClient = globalThis.prismaClient ?? prismaClientSingleton();

export { prismaClient };

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaClient = prismaClient;
}
