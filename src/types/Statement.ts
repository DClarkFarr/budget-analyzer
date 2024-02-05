export enum StatementTypes {
  wells_fargo = "wells_fargo",
  venmo = "venmo",
}
export type StatementType = keyof typeof StatementTypes;
