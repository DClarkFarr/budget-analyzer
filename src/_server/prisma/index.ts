import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
console.log("creating prisma client");

export { prisma };
