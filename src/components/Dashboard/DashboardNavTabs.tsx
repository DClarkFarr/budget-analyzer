"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({
    text,
    href,
    strict,
}: {
    text: string;
    href: string;
    strict?: boolean;
}) {
    const pathname = usePathname();
    const isMatch = strict ? pathname === href : pathname.startsWith(href);
    const stateCls = isMatch ? "text-emerald-700 underline" : "text-gray-700";

    return (
        <Link href={href} className={`dashboard__tab px-1 py-1 ${stateCls}`}>
            {text}
        </Link>
    );
}

export default function DashboardNavTabs({ accountId }: { accountId: number }) {
    return (
        <div className="dashboard__tabs flex gap-x-2 justify-end w-full">
            <Tab
                href={`/dashboard/account/${accountId}`}
                text="Account Dashboard"
                strict
            />
            <Tab
                href={`/dashboard/account/${accountId}/upload`}
                text="Upload Bank Statement"
            />
        </div>
    );
}
