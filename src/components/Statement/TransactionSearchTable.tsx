import {
    Transaction,
    WithCategories,
    WithFoundIndexes,
} from "@/types/Account/Transaction";

export default function TransactionSearchTable({
    transactions,
}: {
    transactions: WithFoundIndexes<WithCategories<Transaction>>[];
}) {
    /**
     * Next steps
     * - break down transactions by month
     * - get total for each month
     * - add monthly dropdowns
     * - add transaction table inside dropdown
     */
    return (
        <div className="search-transactions">
            <h3>Search Results</h3>
            <table className="w-full"></table>
        </div>
    );
}
