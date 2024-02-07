import { ProcessedTransaction } from "@/types/Account/Transaction";
import { prisma } from "../index";
import { StatementType } from "@/types/Statement";

export async function getAccountStatements({}: {
  accountId: number;
  userId: number;
}) {}

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
