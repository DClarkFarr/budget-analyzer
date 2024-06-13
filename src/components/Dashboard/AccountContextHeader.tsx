import useQueryParams from "@/hooks/useQueryParams";
import { useAccountContext } from "../Providers/AccountProvider";
import DashboardNavTabs from "./DashboardNavTabs";
import Link from "next/link";

export function AccountContextHeader() {
    const { account, years, currentYear, showHeader } = useAccountContext();

    const { pushQuery } = useQueryParams();
    if (!account) {
        return null;
    }

    const onSelectYear = <E extends React.MouseEvent>(e: E, year: number) => {
        e.preventDefault();

        pushQuery({ year });
    };
    return (
        <div className="account-context-header">
            <div className="lg:flex gap-x-4">
                <div>
                    <h1 className="">
                        <span className="text-xl text-gray-600 font-light pr-2">
                            Account
                        </span>
                        <span className="text-xl font-semibold">
                            {account.name}
                        </span>
                    </h1>
                </div>
                <div className="ml-auto">
                    <DashboardNavTabs accountId={account.id} />
                </div>
            </div>

            {showHeader && (
                <div className="mb-6 flex flex-wrap lg:flex-nowrap gap-3">
                    <div className="font-semibold">Select Year</div>
                    {years.map((y) => {
                        const isMatch = currentYear === y;
                        const cls = isMatch
                            ? "text-sky-700 font-semibold"
                            : "text-gray-700";

                        if (isMatch) {
                            return (
                                <span className={`px-1 ${cls}`} key={y}>
                                    {y}
                                </span>
                            );
                        }
                        return (
                            <a
                                className={`px-1 ${cls}`}
                                key={y}
                                href="#"
                                onClick={(e) => onSelectYear(e, y)}
                            >
                                {y}
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
