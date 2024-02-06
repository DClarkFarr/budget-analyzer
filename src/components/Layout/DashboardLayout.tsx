import { User } from "@/types/User";
import DashboardHeader from "../Header/DashboardHeader";
import styles from "@/components/Layout/layout.module.scss";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  return (
    <div className={`layout w-full min-h-screen ${styles["layout--account"]}`}>
      <DashboardHeader user={user} />
      <div className="layout__content p-8 bg-white rounded-lg max-w-screen-xl mx-auto">
        {children}
      </div>
    </div>
  );
}
