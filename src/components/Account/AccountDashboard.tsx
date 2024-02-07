"use client";

import { User } from "@/types/User";

export default function AccountDashboard({
  user,
  accountId,
}: {
  user: User;
  accountId: number;
}) {
  return (
    <div className="account-dashboard">
      <h1 className="text-2xl mb-2">Account Dashboard</h1>
      <p className="lead text-lg mb-4 text-gray-600">Account Name: TODO</p>
    </div>
  );
}
