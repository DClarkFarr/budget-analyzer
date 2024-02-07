import { StatementType } from "@/types/Statement";
import UploadDriver from "./FileUploader/UploadDriver";
import WellsFargoUploader from "./FileUploader/WellsFargoUploader";
import VenmoUploader from "./FileUploader/VenmoUploader";

export class FileUploader {
  type: StatementType;
  file: File;

  driver: UploadDriver;
  constructor(type: StatementType, file: File) {
    this.type = type;
    this.file = file;

    this.driver = this.getDriver();
  }

  getDriver() {
    switch (this.type) {
      case "wells_fargo":
        return new WellsFargoUploader(this.file);
      case "venmo":
        return new VenmoUploader(this.file);
      default:
        throw new Error("Invalid statement type");
    }
  }

  async getTransactions() {
    return this.driver.getTransactions();
  }
}
