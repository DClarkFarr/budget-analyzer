import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";

import "./TransactionsTable.scss";
import { formatCurrency } from "@/methods/currency";
import SearchInput from "../Control/SearchInput";
import { Category } from "@/types/Statement";
import Select, { SingleValue } from "react-select";

type Slot<T extends Transaction> = {
    key: string;
    heading: string;
    cell: (t: T) => React.ReactNode;
};

export default function TransactionsTable<WC extends boolean | undefined>({
    footer,
    slots = [],
    transactions,
    withCategories = false,
    showCategories = true,
    selectedCategory,
    onSelectCategory,
    controls,
}: {
    slots?: Slot<any>[];
    transactions: WC extends true
        ? WithCategories<Transaction>[]
        : Transaction[];
    footer?: React.ReactNode;
    withCategories?: WC;
    showCategories?: boolean;
    selectedCategory?: Category | null;
    onSelectCategory?: (category: Category | null) => void;
    controls?: React.ReactNode;
}) {
    const wrapper = useRef<HTMLDivElement>(null);

    const [box, setBbox] = useState<DOMRect | null>(null);
    const [offset, setOffset] = useState(0);

    const set = () => {
        const toSet =
            wrapper && wrapper.current
                ? wrapper.current.getBoundingClientRect()
                : null;

        setBbox(toSet);
    };

    const calculateOffset = () => {
        let o = (box?.top || 0) + (window.scrollY || 0);

        setOffset(o);

        wrapper.current?.style.setProperty("--offset", `${o}px`);
    };

    useEffect(() => {
        set();
        window.addEventListener("resize", set);
        return () => window.removeEventListener("resize", set);
    }, []);

    useEffect(() => {
        calculateOffset();
    }, [wrapper, offset, box]);

    const formattedTransactions = useMemo(() => {
        return transactions.map((t) => ({
            ...t,
            formattedAmount: formatCurrency(t.amount),
            formattedDate: DateTime.fromISO(t.date).toFormat("DD"),
        }));
    }, [transactions]);

    const [searchText, setSearchText] = useState("");
    const [hideIncoming, setHideIncoming] = useState(false);
    const [hideOutgoing, setHideOutgoing] = useState(false);
    const [searchCategory, setSearchCategory] = useState<Category | null>(
        selectedCategory || null
    );
    const [, startTransition] = useTransition();

    const onChangeSearch = (text: string) => {
        setSearchText(text);
    };

    const filteredTransactions = useRef<typeof formattedTransactions>([]);

    const filterTransactions = useCallback(() => {
        return (filteredTransactions.current = formattedTransactions.filter(
            (t) => {
                const textMatches = t.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
                const incomingMatches =
                    !hideIncoming || t.expenseType === "outgoing";
                const outgoingMatches =
                    !hideOutgoing || t.expenseType === "incoming";

                const categoryMatches =
                    !searchCategory ||
                    ((t as WithCategories<Transaction>).categories || []).some(
                        (c) => c.id === searchCategory.id
                    );

                return (
                    textMatches &&
                    incomingMatches &&
                    outgoingMatches &&
                    categoryMatches
                );
            }
        ));
    }, [
        filteredTransactions,
        formattedTransactions,
        searchText,
        hideIncoming,
        hideOutgoing,
        searchCategory,
    ]);

    useEffect(() => {
        filterTransactions();
    }, []);

    useEffect(() => {
        startTransition(() => {
            filterTransactions();
        });
    }, [
        filterTransactions,
        searchText,
        hideIncoming,
        hideOutgoing,
        searchCategory,
    ]);

    const totals = useMemo(() => {
        return filteredTransactions.current.reduce(
            (acc, t) => {
                acc[t.expenseType] += t.amount;
                acc.net += t.expenseType === "incoming" ? t.amount : -t.amount;
                return acc;
            },
            { incoming: 0, outgoing: 0, net: 0 }
        );
    }, [filteredTransactions.current]);

    const categories = useMemo(() => {
        if (!withCategories) return [];

        const catMap = new Map<number, Category>();

        (transactions as WithCategories<Transaction>[]).forEach((t) => {
            t.categories.forEach((c) => {
                if (!catMap.has(c.id)) {
                    catMap.set(c.id, c);
                }
            });
        });

        return Array.from(catMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [transactions.length]);

    const toggleHideIncoming = () => {
        setHideIncoming(!hideIncoming);
    };
    const toggleHideOutgoing = () => {
        setHideOutgoing(!hideOutgoing);
    };

    const onChangeCategorySelection = (newValue: SingleValue<Category>) => {
        setSearchCategory(newValue || null);
        if (
            typeof onSelectCategory === "function" &&
            newValue?.id !== selectedCategory?.id
        ) {
            onSelectCategory(newValue);
        }
    };

    useEffect(() => {
        if (selectedCategory?.id !== searchCategory?.id) {
            setSearchCategory(selectedCategory || null);
        }
    }, [selectedCategory]);

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
                        Showing {filteredTransactions.current.length} of{" "}
                        {formattedTransactions.length} transactions
                    </div>
                    <div>
                        <span className="text-green-600">
                            {formatCurrency(totals.incoming)} Incoming
                        </span>
                        ,{" "}
                        <span className="text-red-600">
                            {formatCurrency(totals.outgoing)} Outgoing
                        </span>
                        ,{" "}
                        <span
                            className={`text-${
                                totals.net >= 0 ? "green" : "red"
                            }-600`}
                        >
                            {formatCurrency(totals.net)} Net
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-x-4 mb-4">
                <div>
                    <Select
                        className="w-[250px]"
                        options={categories}
                        getOptionLabel={(c) => c.name}
                        getOptionValue={(c) => c.id.toString()}
                        value={searchCategory}
                        isClearable
                        isSearchable
                        placeholder="Select category..."
                        onChange={onChangeCategorySelection}
                    />
                </div>
                {controls}
            </div>
            <div className="transactions">
                <div ref={wrapper} className="transactions__wrapper">
                    <div className="transactions__scroller">
                        <table className="transactions__table table table--striped w-full table--sm">
                            <tbody>
                                <tr>
                                    <th className="w-[85px]">Date</th>
                                    <th className="text-right">Amount</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    {slots.map((s) => (
                                        <th key={s.key}>{s.heading}</th>
                                    ))}
                                    {withCategories && showCategories && (
                                        <th>Categories</th>
                                    )}
                                </tr>
                                {filteredTransactions.current.map((t) => (
                                    <tr
                                        className={`type-${t.expenseType}`}
                                        key={t.id}
                                    >
                                        <td className="w-[85px]">
                                            {t.formattedDate}
                                        </td>
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
                                        {slots.map((s) => (
                                            <td key={s.key}>{s.cell(t)}</td>
                                        ))}
                                        {withCategories && showCategories && (
                                            <td>
                                                <div className="min-w-[150px] flex gap-2 flex-wrap">
                                                    {(
                                                        t as WithCategories<Transaction>
                                                    ).categories.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className="category bg-gray-300 rounded-sm leading-none whitespace-nowrap py-1 px-2"
                                                        >
                                                            {c.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {footer}
                    </div>
                </div>
            </div>
        </>
    );
}
