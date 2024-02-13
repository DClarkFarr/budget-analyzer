import { ProcessedTransaction } from "@/types/Account/Transaction";
import UploadDriver from "./UploadDriver";
import { DateTime } from "luxon";

const fileKeys = [
  "empty_1",
  "id",
  "date",
  "type",
  "status",
  "note",
  "from",
  "to",
  "amount",
  "empty_2",
  "empty_3",
  "empty_4",
  "empty_5",
  "empty_6",
  "fundingSource",
  "empty_7",
  "empty_8",
  "empty_9",
  "empty_10",
  "empty_11",
  "empty_12",
  "empty_13",
] as const;

type FileKeys = (typeof fileKeys)[number];

type EmptyKey = `empty_${number}`;
type OmitEmpty<T extends string> = Record<Exclude<T, EmptyKey>, string>;

type KeysOnlyObj = OmitEmpty<FileKeys>;

export default class VenmoUploader extends UploadDriver {
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
    const rows = await this.fileToCsv([...fileKeys]);

    const cleanedRows = rows
      .filter((row) => !!row.id && !!parseInt(row.id))
      .map((row) => {
        var obj = {} as KeysOnlyObj;

        Object.keys(row).forEach((key) => {
          if (!key.startsWith("empty")) {
            obj[key as keyof KeysOnlyObj] = row[key as keyof KeysOnlyObj];
          }
        });

        return obj;
      });

    const transactions: ProcessedTransaction[] = cleanedRows.map((row) => {
      const note = row.note.replace(/[^\d\w\s]/g, "");

      return {
        amount: Math.abs(parseFloat(row.amount.replace(/^[- $]*/, ""))),
        expenseType: row.type === "Payment" ? "outgoing" : "incoming",
        bankType: "venmo",
        description: `From: ${row.from}, To: ${row.to}, Note: ${note}, Source: ${row.fundingSource}`,
        date: DateTime.fromISO(row.date).toISO()!,
        hash: this.strToHash(
          [
            this.accountId,
            row.amount,
            row.type,
            note,
            row.from,
            row.to,
            row.fundingSource,
            row.date,
          ].join("--")
        ),
      };
    });

    this.transactions = transactions;
  }
}
