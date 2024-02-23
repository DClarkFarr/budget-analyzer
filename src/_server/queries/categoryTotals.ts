import { DateTime } from "luxon";
import UserError from "../exceptions/UserException";
import { prisma } from "../prisma/client";

export async function getCategoriesTotals(
  userId: number,
  categoryIds: number[]
) {
  const totalsArr = await Promise.all(
    categoryIds.map(async (categoryId) => {
      return {
        categoryId,
        totals: await getCategoryTotals(userId, categoryId),
      };
    })
  );

  const totals = totalsArr.reduce((acc, { categoryId, totals }) => {
    acc[categoryId] = { ...totals, categoryId };
    return acc;
  }, {} as Record<number, { incoming: number; outgoing: number; net: number; categoryId: number }>);

  return totals;
}

export async function getCategoryTotals(userId: number, categoryId: number) {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
      userId: userId,
    },
  });

  if (!category) {
    throw new UserError("Category not found: " + categoryId);
  }

  const startAt = category.startAt || undefined;
  const endAt = category.endAt || undefined;

  const transactions = await prisma.accountTransaction.findMany({
    where: {
      accountId: category.accountId,
      date: {
        gte: startAt,
        lte: endAt,
      },
      categories: {
        some: {
          categoryId: {
            equals: categoryId,
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  const totals = transactions.reduce(
    (acc, t) => {
      acc[t.expenseType] += parseFloat(t.amount.toFixed(2));
      acc.net +=
        t.expenseType === "incoming"
          ? parseFloat(t.amount.toFixed(2))
          : -parseFloat(t.amount.toFixed(2));
      return acc;
    },
    { incoming: 0, outgoing: 0, net: 0, count: 0 }
  );

  totals.count = transactions.length;

  if (categoryId === 14) {
    console.log("total was", transactions.length, "from", transactions[0]);
  }

  return totals;
}
