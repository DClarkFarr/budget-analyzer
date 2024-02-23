import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

prisma.$on("query", async (e) => {
  // console.log(`Logging Query: ${e.query} ${e.params}`);
});

console.log("creating prisma client");

export { prisma };
