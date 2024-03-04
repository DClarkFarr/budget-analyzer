"use client";

import useQueryParams from "@/hooks/useQueryParams";
import { DateTime } from "luxon";
import { useMemo } from "react";

export default function MonthlyStatement({
    accountId,
    year,
    month,
}: {
    accountId: number;
    year: number;
    month: number;
}) {
    const { redirect } = useQueryParams();
    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => i + 1).map((i) => {
            return {
                id: i,
                name: DateTime.fromObject({ year, month: i }).toFormat("MMM"),
            };
        });
    }, []);

    const onSelectMonth = (e: React.MouseEvent, monthId: number) => {
        e.preventDefault();

        redirect(
            `/dashboard/account/${accountId}/statement/${year}/${monthId}`
        );
    };
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
            <div>Stuff!</div>
        </div>
    );
}
