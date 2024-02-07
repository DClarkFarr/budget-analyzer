import { ProcessedTransaction } from "@/types/Account/Transaction";
import { parse } from "csv-parse";
import crypto from "crypto";

type ArrToObject<T extends string[]> = {
  [K in T[number]]: string;
};
export default abstract class UploadDriver {
  file: File;
  constructor(file: File) {
    this.file = file;
  }
  abstract getTransactions(): Promise<ProcessedTransaction[]>;

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
