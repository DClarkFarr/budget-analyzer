export enum StatementTypes {
  wells_fargo = "wells_fargo",
  venmo = "venmo",
}
export type StatementType = keyof typeof StatementTypes;

export type UploadStatementPayload = {
  type: StatementType;
  file: File;
};

export type UploadStatementResponse = {
  message: string;
  success: boolean;
};
