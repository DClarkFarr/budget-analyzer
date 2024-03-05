import { ProcessedTransaction } from "@/types/Account/Transaction";
import UploadDriver from "./UploadDriver";
import { DateTime } from "luxon";

export default class AfcuUploader extends UploadDriver {
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
            "empty_1",
            "description",
            "debit",
            "credit",
        ]);

        if (rows.length && rows[0].date === "Date") {
            rows.shift();
        }

        rows.forEach((row) => {
            const debit = Math.abs(parseFloat(row.debit || "0"));
            const credit = Math.abs(parseFloat(row.credit || "0"));
            const expenseType = debit > credit ? "outgoing" : "incoming";
            const amount = debit > credit ? debit : credit;

            const description = row.description;
            const date = DateTime.fromFormat(row.date, "M/d/yyyy").toISO()!;

            transactions.push({
                amount,
                expenseType,
                bankType: "afcu",
                description,
                date,
                hash: this.strToHash(
                    [
                        this.accountId,
                        amount,
                        expenseType,
                        description,
                        date,
                    ].join("--")
                ),
            });
        });

        this.transactions = transactions;
    }
}
