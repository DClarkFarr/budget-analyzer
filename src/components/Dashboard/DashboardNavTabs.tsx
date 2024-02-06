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
  const stateCls = isMatch
    ? "bg-white border-emerald-500 text-emerald-700"
    : "bg-gray-100 border-gray-500 text-gray-700";

  return (
    <Link
      href={href}
      className={`dashboard__tab px-2 py-2 rounded-md border border-1 cursor-pointer hover:border-sky-500 hover:bg-sky-100 hover:text-sky-700 ${stateCls}`}
    >
      {text}
    </Link>
  );
}

export default function DashboardNavTabs() {
  return (
    <div className="dashboard__tabs flex gap-x-2 justify-end w-full mb-4">
      <Tab href="/dashboard" text="Accounts" strict />
      <Tab href="/dashboard/upload" text="Upload Bank Statement" />
    </div>
  );
}
