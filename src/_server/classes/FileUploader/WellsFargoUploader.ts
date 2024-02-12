import { ProcessedTransaction } from "@/types/Account/Transaction";
import UploadDriver from "./UploadDriver";
import { DateTime } from "luxon";

export default class WellsFargoUploader extends UploadDriver {
  fileIsValidOrThrow() {
    if (!this.transactions.length) {
      throw new Error("No transactions");
    }

    const [row] = this.transactions;

    if (!(row.date && DateTime.fromISO(row.date).isValid)) {
      throw new Error("Invalid date: " + row.date);
    }

    if (isNaN(row.amount)) {
      throw new Error("Invalid amount: " + row.amount);
    }

    if (!row.description) {
      throw new Error("Invalid description: " + row.description);
    }
  }

  async processTransactions() {
    const transactions: ProcessedTransaction[] = [];

    const rows = await this.fileToCsv([
      "date",
      "amount",
      "empty_1",
      "empty_2",
      "description",
    ] as const);

    rows.forEach((row) => {
      const amount = Math.abs(parseFloat(row.amount));
      const expenseType = row.amount.startsWith("-") ? "outgoing" : "incoming";
      const description = row.description;
      const date = DateTime.fromFormat(row.date, "MM/dd/yyyy").toISO()!;

      transactions.push({
        amount,
        expenseType,
        bankType: "wells_fargo",
        description,
        date,
        hash: this.strToHash(
          [this.accountId, amount, expenseType, description, date].join("--")
        ),
      });
    });

    this.transactions = transactions;
  }
}
