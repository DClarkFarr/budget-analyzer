"use client";

import { DateTime } from "luxon";
import { createContext, useContext, useReducer } from "react";
import { Account } from "@/types/Account";
import AccountService from "@/services/AccountService";

interface AccountProviderState {
    startYear: number;
    endYear: number;
    currentYear: number;
    account: Account | null;
    years: number[];
    showHeader: boolean;
}

interface AccountProviderContext extends AccountProviderState {
    setAccount: (account: Account | null) => Promise<AccountProviderState>;
    setYear: (year: number) => void;
    setShowHeader: (show: boolean) => void;
}

type AccountReducerAction =
    | { type: "set"; payload: Omit<AccountProviderState, "showHeader"> }
    | { type: "year"; payload: number }
    | { type: "clear" }
    | { type: "showHeader"; payload: boolean };

const accountProviderInitialState: AccountProviderState = {
    startYear: DateTime.now().year,
    endYear: DateTime.now().year,
    currentYear: DateTime.now().year,
    years: [],
    account: null,
    showHeader: true,
};

function accountProviderReducer(
    state: AccountProviderState,
    action: AccountReducerAction
): AccountProviderState {
    let toSet = null;
    switch (action.type) {
        case "set":
            toSet = { ...state, ...action.payload };
            break;
        case "year":
            toSet = { ...state, currentYear: action.payload };
            break;
        case "clear":
            toSet = { ...state, ...accountProviderInitialState };
            break;
        case "showHeader":
            toSet = { ...state, showHeader: action.payload };
            break;
    }

    return toSet;
}

const AccountContext = createContext<AccountProviderContext>({
    ...accountProviderInitialState,
    setAccount: async () => ({ ...accountProviderInitialState }),
    setYear: () => {},
    setShowHeader: () => {},
});

export { AccountContext };

export function useAccountContext() {
    const context = useContext(AccountContext);

    return context;
}

const getAccountState = async (
    account: Account
): Promise<Omit<AccountProviderState, "showHeader">> => {
    const stats = await AccountService.getAccountStats(account.id);
    const startYear = (
        stats.startAt
            ? DateTime.fromISO(stats.startAt)
            : DateTime.now().startOf("year")
    ).year;
    const endYear = (
        stats.endAt
            ? DateTime.fromISO(stats.endAt)
            : DateTime.now().endOf("year")
    ).year;

    const years = [];

    let year = startYear;

    while (year <= endYear) {
        years.push(year++);
    }

    return {
        account,
        startYear: startYear,
        currentYear: endYear,
        endYear: endYear,
        years,
    };
};

export function AccountProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(
        accountProviderReducer,
        accountProviderInitialState
    );

    const setAccount = async (account: Account | null) => {
        let payload = { ...state };

        if (account) {
            const toSet = await getAccountState(account);
            payload = { ...payload, ...toSet };

            dispatch({ type: "set", payload: toSet });
        } else {
            dispatch({ type: "clear" });
        }

        return payload;
    };

    const setYear = (year: number) => {
        dispatch({ type: "year", payload: year });
    };

    const setShowHeader = (show: boolean) => {
        dispatch({ type: "showHeader", payload: show });
    };

    return (
        <AccountContext.Provider
            value={{ ...state, setAccount, setYear, setShowHeader }}
        >
            {children}
        </AccountContext.Provider>
    );
}
