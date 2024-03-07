"use client";

import useQueryParams from "@/hooks/useQueryParams";
import { Transaction, WithCategories } from "@/types/Account/Transaction";
import { Category, CategoryTypes } from "@/types/Statement";
import { DateTime } from "luxon";
import { useEffect, useMemo } from "react";
import CategoryTransactionTotals from "./CategoryTransactionTotals";

export default function MonthlyStatement({
    accountId,
    year,
    month,
    transactions,
}: {
    accountId: number;
    year: number;
    month: number;
    transactions: WithCategories<Transaction>[];
}) {
    const { redirect, query } = useQueryParams();

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => i + 1).map((i) => {
            return {
                id: i,
                name: DateTime.fromObject({ year, month: i }).toFormat("MMM"),
            };
        });
    }, []);

    const date = useMemo(() => {
        return DateTime.fromObject({ year, month });
    }, [year, month]);

    const groupedByType = useMemo(() => {
        const typesMap: Record<
            Category["type"],
            { category: Category; transactions: Transaction[] }[]
        > = {
            [CategoryTypes.expense]: [],
            [CategoryTypes.income]: [],
            [CategoryTypes.ignore]: [],
        };

        const catMap = new Map<
            number,
            { category: Category; transactions: Transaction[] }
        >();

        transactions.forEach((t) => {
            t.categories.forEach((c) => {
                if (catMap.has(c.id)) {
                    catMap.get(c.id)?.transactions.push(t);
                } else {
                    catMap.set(c.id, {
                        category: c,
                        transactions: [t],
                    });
                }
            });
        });

        catMap.forEach((val) => {
            typesMap[val.category.type].push(val);
        });

        return typesMap;
    }, [transactions]);

    const onSelectMonth = (e: React.MouseEvent, monthId: number) => {
        e.preventDefault();

        redirect(
            `/dashboard/account/${accountId}/statement/${year}/${monthId}`,
            { year }
        );
    };

    useEffect(() => {
        if (query.year !== String(year) && !!query.year) {
            redirect(
                `/dashboard/account/${accountId}/statement/${query.year}/${month}`,
                {
                    year: query.year,
                }
            );
        }
    }, [year, query.year]);

    return (
        <div className="statement -mt-5">
            <div className="mb-6 flex flex-wrap lg:flex-nowrap gap-3">
                <div className="font-semibold">Select Year</div>
                {months.map((m) => {
                    const isMatch = month === m.id;
                    const cls = isMatch
                        ? "text-sky-700 font-semibold"
                        : "text-gray-700";

                    if (isMatch) {
                        return (
                            <span className={`px-1 ${cls}`} key={m.id}>
                                {m.name}
                            </span>
                        );
                    }
                    return (
                        <a
                            className={`px-1 ${cls}`}
                            key={m.id}
                            href="#"
                            onClick={(e) => onSelectMonth(e, m.id)}
                        >
                            {m.name}
                        </a>
                    );
                })}
            </div>
            <div>
                <div className="mb-4">
                    <CategoryTransactionTotals
                        type="expense"
                        groups={groupedByType.expense}
                        date={date}
                    />
                </div>
                <div className="mb-4">
                    <CategoryTransactionTotals
                        type="income"
                        groups={groupedByType.income}
                        date={date}
                    />
                </div>
                <div className="mb-4">
                    <CategoryTransactionTotals
                        type="ignore"
                        groups={groupedByType.ignore}
                        date={date}
                    />
                </div>
            </div>
        </div>
    );
}
