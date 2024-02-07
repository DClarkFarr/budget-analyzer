import { ProcessedTransaction } from "@/types/Account/Transaction";
import { prisma } from "../index";

export async function getAccountTransactions(accountId: number) {
  return prisma.accountTransaction.findMany({
    where: { accountId },
    orderBy: { date: "desc" },
  });
}

export async function insertTransaction(
  userId: number,
  accountId: number,
  transaction: ProcessedTransaction
) {
  const existing = await prisma.accountTransaction.findFirst({
    where: {
      accountId,
      userId,
      hash: transaction.hash,
    },
  });

  if (existing) {
    return false;
  }

  const created = await prisma.accountTransaction.create({
    data: {
      accountId,
      userId,
      ...transaction,
    },
  });

  return created;
}
