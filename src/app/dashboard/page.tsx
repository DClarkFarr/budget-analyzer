import AccountList from "@/components/Account/AccountList";
import DashboardNavTabs from "@/components/Dashboard/DashboardNavTabs";
import { getSessionUser } from "@/server/actions/sessionActions";

export default async function DashboardPage() {
  const user = (await getSessionUser())!;

  return (
    <div className="dashboard">
      <DashboardNavTabs />

      <AccountList user={user} />
    </div>
  );
}
