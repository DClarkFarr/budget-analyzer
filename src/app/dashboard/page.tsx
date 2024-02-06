import { getSessionUser } from "@/server/actions/sessionActions";
import Link from "next/link";

export default async function DashboardPage() {
  const user = (await getSessionUser())!;

  return (
    <div className="dashboard">
      <div className="dashboard__tabs flex gap-x-2 justify-end w-full">
        <Link
          href="/dashboard/upload"
          className="dashboard__tab px-2 py-2 rounded-md bg-gray-100 text-gray-700 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
        >
          Upload Bank Statement
        </Link>
      </div>
    </div>
  );
}
