import { ProcessedTransaction } from "@/types/Account/Transaction";
import { insertTransaction } from "../prisma/statement/statement.methods";
import { StatementType } from "@/types/Statement";

export default async function importProcessedTransactions(
  userId: number,
  accountId: number,
  rows: ProcessedTransaction[]
) {
  let created = 0;
  let skipped = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (i % 10 === 0) {
      console.log("parsing row", i, " of ", rows.length - 1, row);
    }

    (await insertTransaction(userId, accountId, row)) ? created++ : skipped++;
  }

  return { created, skipped };
}
