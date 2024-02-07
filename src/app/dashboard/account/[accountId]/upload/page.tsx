import DashboardNavTabs from "@/components/Dashboard/DashboardNavTabs";
import UploadForm from "@/components/Statement/UploadForm";
import { getSessionUser } from "@/server/actions/sessionActions";

export default async function UploadStatementPage({
  params,
}: {
  params: { accountId: string };
}) {
  const user = (await getSessionUser())!;

  return (
    <div className="upload">
      <DashboardNavTabs accountId={parseInt(params.accountId)} />

      <h2 className="text-2xl mb-1">Upload Bank Statement</h2>
      <p className="mb-4">
        Duplicate records from previous entries will be skipped.
      </p>

      <UploadForm accountId={parseInt(params.accountId)} />
    </div>
  );
}
