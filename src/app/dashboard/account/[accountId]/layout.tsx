"use client";

import { useAccountContext } from "@/components/Providers/AccountProvider";
import AccountService from "@/services/AccountService";
import { DateTime } from "luxon";
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { useEffect } from "react";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const { setAccount, setYear, account } = useAccountContext();

    const setAccountToContext = async (accountId: number) => {
        if (account?.id !== accountId) {
            const account = await AccountService.get(accountId);
            const state = await setAccount(account);

            const urlYear = searchParams.get("year")
                ? parseFloat(searchParams.get("year")!)
                : null;

            const maxYear = DateTime.fromISO(state.endYear).year;
            const minYear = DateTime.fromISO(state.startYear).year;
            const currentYear = DateTime.fromISO(state.currentYear).year;

            if (urlYear) {
                if (
                    urlYear >= minYear &&
                    urlYear <= maxYear &&
                    urlYear !== currentYear
                ) {
                    router.push(`?year=${currentYear}`);
                } else if (urlYear !== currentYear) {
                    router.push(`?year=${currentYear}`);
                }
            } else {
                router.push(`?year=${currentYear}`);
            }
        }
    };

    const currentYear = searchParams?.get("year")?.toString() || "";
    useEffect(() => {
        if (currentYear) {
            setYear(currentYear);
        }
    }, [currentYear]);

    useEffect(() => {
        if (params.accountId) {
            setAccountToContext(parseFloat(params.accountId.toString()));
        }
    }, [params]);

    return (
        <div className="account-layout">
            {account && children}
            {!account && <div>Loading Account</div>}
        </div>
    );
}
