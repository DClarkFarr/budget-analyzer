import { prisma } from "../index";

export async function getCategories(accountId: number) {
  return prisma.category.findMany({
    where: { accountId },
    orderBy: { name: "asc" },
  });
}
