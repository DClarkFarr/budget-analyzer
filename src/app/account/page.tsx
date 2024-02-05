import { getSessionUser } from "@/server/actions/sessionActions";
import LogoutButton from "@/components/User/LogoutButton";
import Link from "next/link";

export default async function AccountPage() {
  const user = (await getSessionUser())!;

  return (
    <div className="account">
      <div className="account__tabs flex gap-x-2 justify-end w-full">
        <Link
          href="/account/upload"
          className="account__tab px-2 py-2 rounded-md bg-gray-100 text-gray-700 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
        >
          Upload Bank Statement
        </Link>
      </div>
    </div>
  );
}
