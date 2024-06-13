import { useAccountContext } from "@/components/Providers/AccountProvider";
import SearchesManager from "@/components/Searches/SearchesManager";

export default async function AccountSearchPage({
    params,
}: {
    params: { accountId: number };
}) {
    return (
        <div className="account-dashboard__search">
            <SearchesManager accountId={params.accountId} />
        </div>
    );
}
