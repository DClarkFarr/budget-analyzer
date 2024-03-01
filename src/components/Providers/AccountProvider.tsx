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
}

interface AccountProviderContext extends AccountProviderState {
    setAccount: (account: Account | null) => Promise<AccountProviderState>;
    setYear: (year: number) => void;
}

type AccountReducerAction =
    | { type: "set"; payload: AccountProviderState }
    | { type: "year"; payload: number }
    | { type: "clear" };

const accountProviderInitialState: AccountProviderState = {
    startYear: DateTime.now().year,
    endYear: DateTime.now().year,
    currentYear: DateTime.now().year,
    years: [],
    account: null,
};

function accountProviderReducer(
    state: AccountProviderState,
    action: AccountReducerAction
): AccountProviderState {
    switch (action.type) {
        case "set":
            return { ...state, ...action.payload };
        case "year":
            return { ...state, currentYear: action.payload };
        case "clear":
            return { ...state, ...accountProviderInitialState };
    }
}

const AccountContext = createContext<AccountProviderContext>({
    ...accountProviderInitialState,
    setAccount: async () => ({ ...accountProviderInitialState }),
    setYear: () => {},
});

export { AccountContext };

export function useAccountContext() {
    const context = useContext(AccountContext);

    return context;
}

const getAccountState = async (
    account: Account
): Promise<AccountProviderState> => {
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
        let payload = { ...accountProviderInitialState };
        if (account) {
            payload = await getAccountState(account);
            dispatch({ type: "set", payload });
        } else {
            dispatch({ type: "clear" });
        }

        return payload;
    };

    const setYear = (year: number) => {
        dispatch({ type: "year", payload: year });
    };

    return (
        <AccountContext.Provider value={{ ...state, setAccount, setYear }}>
            {children}
        </AccountContext.Provider>
    );
}
