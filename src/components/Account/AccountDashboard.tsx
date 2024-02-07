"use client";

import useAccountQuery from "@/hooks/useAccountQuerry";
import { User } from "@/types/User";

export default function AccountDashboard({
  user,
  accountId,
}: {
  user: User;
  accountId: number;
}) {
  const { accountData, isLoading } = useAccountQuery(accountId);

  return (
    <div className="account-dashboard">
      <h1 className="text-2xl mb-2">Account Dashboard</h1>
      {isLoading && (
        <div className="p-[100px] w-full flex justify-center items-center text-2xl text-gray-500 font-semibold">
          Loading...
        </div>
      )}
      {!isLoading && accountData && (
        <>
          <p className="lead text-lg mb-4 text-gray-600">
            Account Name: {accountData.name}
          </p>
        </>
      )}
    </div>
  );
}
