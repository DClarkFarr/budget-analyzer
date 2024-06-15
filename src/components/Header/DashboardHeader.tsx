"use client";

import { User } from "@/types/User";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/Layout/layout.module.scss";
import { destroySession } from "@/_server/actions/sessionActions";

export default function DashboardHeader({ user }: { user: User }) {
    const onClickLogout = async () => {
        destroySession();
    };

    const pathname = usePathname();

    const bindLink = (href: string, toMatch = href, nested = false) => {
        const isActive = nested
            ? !!(pathname || "").match(new RegExp(`^${toMatch}`))
            : toMatch === pathname;

        return {
            href,
            className: `btn-link text-sky-700 ${styles.navLink}`,
            "data-active": isActive,
        };
    };

    return (
        <div className="header header--account p-4 border-b border-slate-300 mb-8 text-slate-500">
            <div
                className={`header__container mx-auto flex gap-x-3 items-center max-w-screen-xl`}
            >
                <div className="header__brand font-bold text-lg">
                    Budget Analyzer
                </div>

                <div className="ml-auto">Welcome, {user.name}</div>
                <div className="">
                    <Link {...bindLink("/dashboard")}>Dashboard</Link>
                </div>
                <div className="">
                    <Link {...bindLink("/dashboard/searches")}>Searches</Link>
                </div>
                <div onClick={onClickLogout}>
                    <button className="btn-link text-sky-700">Logout</button>
                </div>
            </div>
        </div>
    );
}
