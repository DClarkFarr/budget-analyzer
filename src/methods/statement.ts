import { Transaction, WithFoundIndexes } from "@/types/Account/Transaction";
import { CategoryType } from "@/types/Statement";

export function sumCategoryTypeTransactions(
    type: CategoryType,
    transactions: Transaction[],
    ignoreIgnored = true
) {
    const totals = { incoming: 0, outgoing: 0, net: 0, ignored: 0 };

    transactions.forEach((t) => {
        if (type === "ignore" && ignoreIgnored) {
            totals.ignored += t.amount;
        } else if (t.expenseType === "incoming") {
            totals.incoming += t.amount;
        } else {
            totals.outgoing += t.amount;
        }
    });

    totals.net = totals.incoming - totals.outgoing;

    return totals;
}

export function sumSearchTransactions(
    transactions: WithFoundIndexes<Transaction>[],
    visibleFilters: number[],
    excludedTransactionIds: number[]
) {
    const totals = { incoming: 0, outgoing: 0, ignored: 0, net: 0 };

    transactions.forEach((t) => {
        if (
            !visibleFilters.some((fi) => t.foundbyFilters.includes(fi)) ||
            excludedTransactionIds.includes(t.id)
        ) {
            totals.ignored += t.amount;
        } else if (t.expenseType === "incoming") {
            totals.incoming += t.amount;
        } else {
            totals.outgoing += t.amount;
        }
    });

    totals.net = totals.incoming - totals.outgoing;

    return totals;
}
