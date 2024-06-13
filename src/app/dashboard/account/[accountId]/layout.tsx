"use client";

import { AccountContextHeader } from "@/components/Dashboard/AccountContextHeader";
import { useAccountContext } from "@/components/Providers/AccountProvider";
import useQueryParams from "@/hooks/useQueryParams";
import AccountService from "@/services/AccountService";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import { throttle } from "lodash-es";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const { query, pushQuery } = useQueryParams();
    const pathname = usePathname();

    const { setAccount, setYear, setShowHeader, account } = useAccountContext();

    const setAccountToContext = async (accountId: number) => {
        if (account?.id !== accountId) {
            const account = await AccountService.get(accountId);
            const state = await setAccount(account);

            const urlYear = query.year ? parseFloat(query.year) : null;

            if (urlYear) {
                if (
                    urlYear >= state.startYear &&
                    urlYear <= state.endYear &&
                    urlYear !== state.currentYear
                ) {
                    setYear(urlYear);
                } else if (urlYear !== state.currentYear) {
                    pushQuery({ year: state.currentYear });
                }
            } else {
                pushQuery({ year: state.currentYear });
            }
        }
    };

    const throttleQueryAccount = useMemo(() => {
        return throttle(setAccountToContext, 1000);
    }, []);

    const currentYear = query.year || "";

    useEffect(() => {
        if (currentYear) {
            setYear(parseFloat(currentYear));
        }
    }, [currentYear]);

    useEffect(() => {
        if (params.accountId) {
            throttleQueryAccount(parseFloat(params.accountId.toString()));
        }
    }, [params.accountId]);

    const basePath = useMemo(
        () => `/dashboard/account/${params.accountId}`,
        [params.accountId]
    );

    useEffect(() => {
        const noHeaderPages = ["/search"].map((page) => `${basePath}${page}`);
        const noHeader = noHeaderPages.includes(pathname);

        setShowHeader(!noHeader);
    }, [pathname, basePath]);

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
