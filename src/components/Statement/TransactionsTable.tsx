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

import "./TransactionsTable.scss";
import { formatCurrency } from "@/methods/currency";
import SearchInput from "../Control/SearchInput";

const bankMap = {
  wells_fargo: "Wells Fargo",
  venmo: "Venmo",
};

export default function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
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
  const [, startTransition] = useTransition();

  const onChangeSearch = (text: string) => {
    setSearchText(text);
  };

  const filteredTransactions = useRef<typeof formattedTransactions>([]);

  const filterTransactions = useCallback(() => {
    return (filteredTransactions.current = formattedTransactions.filter((t) => {
      const textMatches = t.description
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const incomingMatches = !hideIncoming || t.expenseType === "outgoing";
      const outgoingMatches = !hideOutgoing || t.expenseType === "incoming";

      return textMatches && incomingMatches && outgoingMatches;
    }));
  }, [
    filteredTransactions,
    formattedTransactions,
    searchText,
    hideIncoming,
    hideOutgoing,
  ]);

  useEffect(() => {
    filterTransactions();
  }, []);

  useEffect(() => {
    startTransition(() => {
      filterTransactions();
    });
  }, [filterTransactions, searchText, hideIncoming, hideOutgoing]);

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
            <span className={`text-${totals.net >= 0 ? "green" : "red"}-600`}>
              {formatCurrency(totals.net)} Net
            </span>
          </div>
        </div>
      </div>
      <div className="transactions">
        <div ref={wrapper} className="transactions__wrapper">
          <div className="transactions__scroller">
            <table className="transactions__table table table--striped w-full table--sm">
              <tbody>
                <tr>
                  <th>Date</th>
                  <th className="text-right">Amount</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Bank</th>
                </tr>
                {filteredTransactions.current.map((t) => (
                  <tr className={`type-${t.expenseType}`} key={t.id}>
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
