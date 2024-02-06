import UserError from "@/server/exceptions/UserException";
import { AccountFormState } from "@/types/Account";
import { prisma } from "../index";
import { Account } from "@prisma/client";

export async function createAccount(userId: number, data: AccountFormState) {
  if (!data.name || data.name.length < 3) {
    throw new UserError("Name is required");
  }
  if (!data.color) {
    throw new UserError("Color is required");
  }
  if (!(data.color.startsWith("#") && data.color.length === 7)) {
    throw new UserError("Invalid color. Use format #000000");
  }

  const existing = await prisma.account.findFirst({
    where: { name: data.name, userId },
  });

  if (existing) {
    throw new UserError("Account with this name already exists");
  }

  const created = await prisma.account.create({
    data: {
      userId,
      ...data,
    },
  });

  return created as Account;
}
