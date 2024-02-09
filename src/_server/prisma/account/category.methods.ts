import { CategoryFormState } from "@/types/Statement";
import { prisma } from "../index";
import UserError from "@/server/exceptions/UserException";
import { DateTime } from "luxon";

export async function getCategories(accountId: number) {
  return prisma.category.findMany({
    where: { accountId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(
  userId: number,
  accountId: number,
  data: CategoryFormState
) {
  if (!data.name || data.name.length < 2) {
    throw new UserError("Category name must be at least 2 characters long");
  }

  if (!data.type || !["expense", "income", "ignore"].includes(data.type)) {
    throw new UserError(
      "Category type must be either 'expense' or 'income', or 'ignore'"
    );
  }

  const startAt = DateTime.fromSQL(data.startAt || "");
  const endAt = DateTime.fromSQL(data.endAt || "");

  if (data.startAt && !startAt.isValid) {
    throw new UserError("Invalid start date");
  }

  if (data.endAt && !endAt.isValid) {
    throw new UserError("Invalid end date");
  }

  return prisma.category.create({
    data: {
      userId,
      accountId,
      name: data.name,
      type: data.type,
      startAt: data.startAt ? startAt.toISO() : null,
      endAt: data.endAt ? endAt.toISO() : null,
    },
  });
}
