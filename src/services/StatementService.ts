import {
  UploadStatementPayload,
  UploadStatementResponse,
} from "@/types/Statement";
import webApi from "./webApi";

export default class StatementService {
  static async uploadStatement(data: UploadStatementPayload) {
    const fd = new FormData();
    fd.append("type", data.type);
    fd.append("file", data.file);

    return webApi
      .post<UploadStatementResponse>("/statement/upload", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
}
