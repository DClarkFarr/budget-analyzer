import { StatementType } from "../Statement";

export enum EXPENSE_TYPES {
  "incoming" = "incoming",
  "outgoing" = "outgoing",
}

export type ExpenseType = keyof typeof EXPENSE_TYPES;

export type Transaction = {
  id: number;
  accountId: number;
  userId: number;
  bankType: StatementType;
  expenseType: ExpenseType;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  hash: string;
};
export type ProcessedTransaction = Omit<
  Transaction,
  "id" | "accountId" | "userId" | "createdAt"
>;