"use client";

import { AccountContextHeader } from "@/components/Dashboard/AccountContextHeader";
import { useAccountContext } from "@/components/Providers/AccountProvider";
import useQueryParams from "@/hooks/useQueryParams";
import AccountService from "@/services/AccountService";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { throttle } from "lodash-es";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const { query, pushQuery } = useQueryParams();

    const { setAccount, setYear, account } = useAccountContext();

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
