import { getSessionUser } from "@/server/actions/sessionActions";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { redirect } from "next/navigation";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user?.id) {
    return redirect("/login?not=authorized");
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
