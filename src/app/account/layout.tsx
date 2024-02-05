import { getSessionUser } from "@/server/actions/sessionActions";
import AccountLayout from "@/components/Layout/AccountLayout";
import { redirect } from "next/navigation";

export default async function AccountLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("account layout wants session");
  const user = await getSessionUser();

  if (!user?.id) {
    return redirect("/login?not=authorized");
  }

  return <AccountLayout user={user}>{children}</AccountLayout>;
}
