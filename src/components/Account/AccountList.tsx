"use client";
import useAccountStatsQuery from "@/hooks/useAccountStatsQuery";
import useAccountsQuery from "@/hooks/useAccountsQuery";
import { formatNumber } from "@/methods/number";
import { Account } from "@/types/Account";
import { User } from "@/types/User";
import { DateTime } from "luxon";
import Link from "next/link";
import { useAccountContext } from "../Providers/AccountProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountList({ user }: { user: User }) {
    const { accounts, isLoading } = useAccountsQuery(user.id);
    const { stats, isLoading: statsLoading } = useAccountStatsQuery(user.id);
    const router = useRouter();

    const accountContext = useAccountContext();

    const [enteringAccount, setEnteringAccount] = useState<number | null>(null);

    useEffect(() => {
        accountContext.setAccount(null);
    }, []);

    const onEnterAccount = async (account: Account) => {
        await accountContext.setAccount(account);
        router.push(`/dashboard/account/${account.id}`);
    };

    return (
        <div className="account__list">
            <div className="flex w-full items-center mb-4">
                <div>
                    <h2 className="text-2xl mb-1">Accounts</h2>
                    <p className="mb-4">View and manage your accounts.</p>
                </div>
                <div className="ml-auto">
                    <Link
                        className="btn btn-primary"
                        href="/dashboard/account/create"
                    >
                        Create a new Account
                    </Link>
                </div>
            </div>

            {isLoading && (
                <div className="text-gray-500">Loading Accounts...</div>
            )}
            {!isLoading && (
                <table className="accounts-table w-full">
                    <thead>
                        <tr>
                            <th className="text-left px-3 py-2 id">ID</th>
                            <th className="text-left px-3 py-2 name">Name</th>
                            <th className="text-left px-3 py-2 transactions-count">
                                Transactions #
                            </th>
                            <th className="text-left px-3 py-2 transactions-range">
                                Transactions Range
                            </th>
                            <th className="text-left actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => {
                            const accountStats = stats[account.id] || {
                                count: 0,
                                startAt: null,
                                endAt: null,
                            };
                            return (
                                <tr key={account.id}>
                                    <td className="px-3 py-2">{account.id}</td>
                                    <td className="px-3 py-2">
                                        {account.name}
                                    </td>
                                    <td className="px-3 py-2 w-1/3">
                                        {statsLoading && "Loading..."}
                                        {!statsLoading &&
                                            formatNumber(accountStats.count)}
                                    </td>
                                    <td className="px-3 py-2 w-1/3">
                                        {statsLoading && "Loading..."}
                                        {!statsLoading && accountStats.startAt
                                            ? DateTime.fromISO(
                                                  accountStats.startAt
                                              ).toFormat("DD")
                                            : "N/A"}
                                        {!statsLoading && " - "}
                                        {!statsLoading && accountStats.endAt
                                            ? DateTime.fromISO(
                                                  accountStats.endAt
                                              ).toFormat("DD")
                                            : "N/A"}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() =>
                                                onEnterAccount(account)
                                            }
                                            disabled={
                                                enteringAccount === account.id
                                            }
                                        >
                                            {enteringAccount === account.id
                                                ? "Entering..."
                                                : "Enter Account"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
