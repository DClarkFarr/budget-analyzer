export enum EXPENSE_TYPES {
  "incoming" = "incoming",
  "outgoing" = "outgoing",
}

export type ExpenseType = keyof typeof EXPENSE_TYPES;

export type Transaction = {
  id: number;
  accountId: number;
  userId: number;
  expenseType: ExpenseType;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  hash: string;
};
