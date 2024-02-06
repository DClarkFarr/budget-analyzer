import { User } from "@/types/User";
import Link from "next/link";

export default async function AccountList({ user }: { user: User }) {
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
    </div>
  );
}
