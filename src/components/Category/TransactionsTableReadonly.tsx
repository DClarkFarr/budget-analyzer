import { Transaction } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";

import { formatCurrency } from "@/methods/currency";
import SearchInput from "../Control/SearchInput";
import { debounce } from "lodash-es";

import "./TransactionsTableReadonly.scss";

const bankMap = {
    wells_fargo: "Wells Fargo",
    venmo: "Venmo",
};

export default function TransactionsTableReadonly({
    transactions,
    matchedTransactionsIds,
    height = 300,
}: {
    transactions: Transaction[];
    matchedTransactionsIds: number[];
    height?: number;
}) {
    const [searchText, setSearchText] = useState("");
    const [hideIncoming, setHideIncoming] = useState(false);
    const [hideOutgoing, setHideOutgoing] = useState(false);
    const [, startTransition] = useTransition();

    const onChangeSearch = (text: string) => {
        setSearchText(text);
    };

    const [filteredTransactions, setFilteredTransactions] = useState<
        (Transaction & {
            matched: boolean;
            formattedAmount: string;
            formattedDate: string;
        })[]
    >([]);

    const filterTransactions = useCallback(() => {
        const filtered = transactions
            .map((t) => ({
                ...t,
                formattedAmount: formatCurrency(t.amount),
                formattedDate: DateTime.fromISO(t.date).toFormat("DD"),
                matched: matchedTransactionsIds.includes(t.id),
            }))
            .filter((t) => {
                const textMatches = t.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
                const incomingMatches =
                    !hideIncoming || t.expenseType === "outgoing";
                const outgoingMatches =
                    !hideOutgoing || t.expenseType === "incoming";

                return textMatches && incomingMatches && outgoingMatches;
            })
            .sort((a, b) => {
                if (a.matched !== b.matched) {
                    return a.matched ? -1 : 1;
                }

                return a.date < b.date ? -1 : 1;
            });

        setFilteredTransactions(filtered);
    }, [
        transactions,
        searchText,
        hideIncoming,
        hideOutgoing,
        matchedTransactionsIds,
    ]);

    const debouncer = useRef(
        debounce((toDebounce: () => void) => {
            toDebounce();
        }, 300)
    );

    useEffect(() => {
        debouncer.current(filterTransactions);
    }, []);

    useEffect(() => {
        debouncer.current(filterTransactions);
    }, [
        filterTransactions,
        matchedTransactionsIds,
        searchText,
        hideIncoming,
        hideOutgoing,
    ]);

    const toggleHideIncoming = () => {
        setHideIncoming(!hideIncoming);
    };
    const toggleHideOutgoing = () => {
        setHideOutgoing(!hideOutgoing);
    };

    return (
        <>
            <div className="lg:flex items-center justify-between mb-3">
                <div>
                    <div className="flex items-center gap-x-4">
                        <div>
                            <SearchInput
                                placeholder="Search Transactions..."
                                onSearch={onChangeSearch}
                            />
                        </div>
                        <div>
                            <div className="flex item-center gap-x-3">
                                <div>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={1}
                                            onChange={toggleHideIncoming}
                                            checked={hideIncoming}
                                        />{" "}
                                        Hide Incoming
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={1}
                                            onChange={toggleHideOutgoing}
                                            checked={hideOutgoing}
                                        />{" "}
                                        Hide Outgoing
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        Showing {filteredTransactions.length} of{" "}
                        {filteredTransactions.length} transactions
                    </div>
                </div>
            </div>
            <div className="transactions">
                <div
                    className="transactions__wrapper overflow-y-auto"
                    style={{ height: `${height}px` }}
                >
                    <div className="transactions__scroller">
                        <table
                            cellPadding={0}
                            cellSpacing={0}
                            className={`transactions__table table w-full table--sm`}
                        >
                            <tbody>
                                <tr>
                                    <th>Date</th>
                                    <th className="text-right">Amount</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Bank</th>
                                </tr>
                                {filteredTransactions.map((t) => (
                                    <tr
                                        className={`type-${t.expenseType} ${
                                            t.matched ? "matched" : ""
                                        }`}
                                        key={t.id}
                                    >
                                        <td>{t.formattedDate}</td>
                                        <td
                                            className={`text-right ${
                                                t.expenseType === "incoming"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {t.formattedAmount}
                                        </td>
                                        <td>{t.expenseType}</td>
                                        <td>{t.description}</td>
                                        <td>{bankMap[t.bankType]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
