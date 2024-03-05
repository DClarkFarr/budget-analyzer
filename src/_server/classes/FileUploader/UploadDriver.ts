import { ProcessedTransaction } from "@/types/Account/Transaction";
import { parse } from "csv-parse";
import crypto from "crypto";

type ArrToObject<T extends string[]> = {
    [K in T[number]]: string;
};
export default abstract class UploadDriver {
    accountId: number;
    file: File;
    transactions: ProcessedTransaction[] = [];

    constructor(accountId: number, file: File) {
        this.accountId = accountId;
        this.file = file;
    }
    async getTransactions(): Promise<ProcessedTransaction[]> {
        if (!this.transactions.length) {
            await this.processTransactions();
        }

        this.fileIsValidOrThrow();

        return this.transactions;
    }

    abstract processTransactions(): Promise<void>;

    abstract fileIsValidOrThrow(): void;

    strToHash(str: string) {
        return crypto.createHash("md5").update(str).digest("hex");
    }

    async fileToCsv<C extends string[]>(columns: C) {
        const bytes = await this.file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise<ArrToObject<C>[]>((resolve, reject) => {
            parse(
                buffer,
                {
                    delimiter: ",",
                    columns,
                },
                (error, result: ArrToObject<C>[]) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }
            );
        });
    }
}
