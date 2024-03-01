"use client";

import { AccountContextHeader } from "@/components/Dashboard/AccountContextHeader";
import { useAccountContext } from "@/components/Providers/AccountProvider";
import AccountService from "@/services/AccountService";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

            if (urlYear) {
                if (
                    urlYear >= state.startYear &&
                    urlYear <= state.endYear &&
                    urlYear !== state.currentYear
                ) {
                    router.push(`?year=${state.currentYear}`);
                } else if (urlYear !== state.currentYear) {
                    router.push(`?year=${state.currentYear}`);
                }
            } else {
                router.push(`?year=${state.currentYear}`);
            }
        }
    };

    const currentYear = searchParams?.get("year")?.toString() || "";

    useEffect(() => {
        if (currentYear) {
            setYear(parseFloat(currentYear));
        }
    }, [currentYear]);

    useEffect(() => {
        if (params.accountId) {
            setAccountToContext(parseFloat(params.accountId.toString()));
        }
    }, [params]);

    return (
        <div className="account-layout">
            {account && (
                <>
                    <AccountContextHeader />
                    {children}
                </>
            )}
            {!account && <div>Loading Account</div>}
        </div>
    );
}
