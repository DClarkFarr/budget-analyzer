import { ProcessedTransaction } from "@/types/Account/Transaction";
import UploadDriver from "./UploadDriver";

export default class VenmoUploader extends UploadDriver {
  async getTransactions() {
    const transactions: ProcessedTransaction[] = [];

    const rows = await this.fileToCsv(["t", "b", "d"]);

    console.log("got rows", rows);
    return transactions;
  }
}
