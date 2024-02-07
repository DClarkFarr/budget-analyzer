import { Transaction } from "@/types/Account/Transaction";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";

import "./TransactionsTable.scss";

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

  return (
    <div className="transactions" style={{ "--offset": `${offset}px;` }}>
      <div ref={wrapper} className="transactions__wrapper">
        <div className="transactions__scroller">
          <table className="transactions__table table table--striped w-full table--sm">
            <tbody>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Description</th>
                <th>Bank</th>
              </tr>
              {transactions.map((t) => (
                <tr className={`type-${t.expenseType}`} key={t.id}>
                  <td>{DateTime.fromISO(t.date).toFormat("DD")}</td>
                  <td>{t.amount}</td>
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
  );
}
