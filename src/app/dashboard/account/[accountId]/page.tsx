import AccountDashboard from "@/components/Account/AccountDashboard";
import { getSessionUser } from "@/server/actions/sessionActions";

export default async function CreateAccountPage({
    params,
}: {
    params: { accountId: string };
}) {
    const user = (await getSessionUser())!;

    return (
        <div className="account-dashboard__page">
            <AccountDashboard
                user={user}
                accountId={parseInt(params.accountId)}
            />
        </div>
    );
}
