"use client";
import useAccountsQuery from "@/hooks/useAccountsQuery";
import { User } from "@/types/User";
import Link from "next/link";

export default function AccountList({ user }: { user: User }) {
  const { accounts, isLoading } = useAccountsQuery(user.id);

  return (
    <div className="account__list">
      <div className="flex w-full items-center mb-4">
        <div>
          <h2 className="text-2xl mb-1">Accounts</h2>
          <p className="mb-4">View and manage your accounts.</p>
        </div>
        <div className="ml-auto">
          <Link className="btn btn-primary" href="/dashboard/account/create">
            Create a new Account
          </Link>
        </div>
      </div>

      {isLoading && <div className="text-gray-500">Loading Accounts...</div>}
      {!isLoading && (
        <table className="accounts-table w-full">
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
          {accounts.map((account) => (
            <tr key={account.id}>
              <td className="px-3 py-2">{account.id}</td>
              <td className="px-3 py-2">{account.name}</td>
              <td className="px-3 py-2 w-1/3">TO DO</td>
              <td className="px-3 py-2 w-1/3">TO DO</td>
              <td>
                <Link
                  className="btn btn-primary btn-sm"
                  href={`/dashboard/account/${account.id}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </table>
      )}
    </div>
  );
}
