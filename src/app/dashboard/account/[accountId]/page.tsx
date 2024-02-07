import AccountDashboard from "@/components/Account/AccountDashboard";
import DashboardNavTabs from "@/components/Dashboard/DashboardNavTabs";
import { getSessionUser } from "@/server/actions/sessionActions";

export default async function CreateAccountPage({
  params,
}: {
  params: { accountId: string };
}) {
  const user = (await getSessionUser())!;

  return (
    <div className="account-dashboard__page">
      <DashboardNavTabs accountId={parseInt(params.accountId)} />
      <AccountDashboard user={user} accountId={parseInt(params.accountId)} />
    </div>
  );
}
