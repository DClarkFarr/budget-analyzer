import { StatementType } from "@/types/Statement";
import UploadDriver from "./FileUploader/UploadDriver";
import WellsFargoUploader from "./FileUploader/WellsFargoUploader";
import VenmoUploader from "./FileUploader/VenmoUploader";

export class FileUploader {
  type: StatementType;
  file: File;
  accountId: number;

  driver: UploadDriver;
  constructor(accountId: number, type: StatementType, file: File) {
    this.type = type;
    this.file = file;
    this.accountId = accountId;

    this.driver = this.getDriver();
  }

  getDriver() {
    switch (this.type) {
      case "wells_fargo":
        return new WellsFargoUploader(this.accountId, this.file);
      case "venmo":
        return new VenmoUploader(this.accountId, this.file);
      default:
        throw new Error("Invalid statement type");
    }
  }

  async getTransactions() {
    return this.driver.getTransactions();
  }
}
