import { User } from "@/types/User";
import AccountHeader from "../Header/AccountHeader";
import styles from "@/components/Layout/layout.module.scss";

export default function AccountLayout({
    children,
    user,
}: {
    children: React.ReactNode;
    user: User;
}) {
    return (
        <div
            className={`layout w-full min-h-screen ${styles["layout--account"]}`}
        >
            <AccountHeader user={user} />
            <div className="layout__content p-8 bg-white rounded-lg max-w-screen-xl mx-auto">
                {children}
            </div>
        </div>
    );
}
