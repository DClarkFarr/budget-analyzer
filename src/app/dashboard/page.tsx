import AccountList from "@/components/Account/AccountList";
import { getSessionUser } from "@/server/actions/sessionActions";

export default async function DashboardPage() {
  const user = (await getSessionUser())!;

  return (
    <div className="dashboard">
      <AccountList user={user} />
    </div>
  );
}
