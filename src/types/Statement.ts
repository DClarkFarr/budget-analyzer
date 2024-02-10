import { ExpenseType } from "./Account/Transaction";

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
    created: number;
    skipped: number;
};

export enum CategoryTypes {
    income = "income",
    expense = "expense",
    ignore = "ignore",
}

export type CategoryType = keyof typeof CategoryTypes;

export type Category = {
    id: number;
    accountId: number;
    userId: number;
    name: string;
    type: CategoryType;
    startAt: string | null;
    endAt: string | null;
    createdAt: string;
};

export type CategoryRule = {
    id: number;
    categoryId: number;
    userId: number;
    name: string;
    rule: string;
    transactionType: ExpenseType | null;
    createdAt: string;
};

export type CategoryFormState = Omit<
    Category,
    "id" | "accountId" | "userId" | "createdAt"
>;

export type CategoryRuleFormState = {
    name: string;
    rule: string;
    transactionType: ExpenseType | "";
};
