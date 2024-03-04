import { Transaction } from "@/types/Account/Transaction";
import { CategoryType } from "@/types/Statement";

export function sumCategoryTypeTransactions(
    type: CategoryType,
    transactions: Transaction[]
) {
    const totals = { incoming: 0, outgoing: 0, net: 0 };

    transactions.forEach((t) => {
        if (type === "ignore") {
            return;
        }

        if (t.expenseType === "incoming") {
            totals.incoming += t.amount;
        } else {
            totals.outgoing += t.amount;
        }
    });

    totals.net = totals.incoming - totals.outgoing;

    return totals;
}
