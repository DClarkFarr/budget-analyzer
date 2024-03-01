"use client";

import { DateTime } from "luxon";
import { createContext, useContext, useReducer } from "react";
import { Account } from "@/types/Account";
import AccountService from "@/services/AccountService";

interface AccountProviderState {
    startYear: string;
    endYear: string;
    currentYear: string;
    account: Account | null;
    years: string[];
}

interface AccountProviderContext extends AccountProviderState {
    setAccount: (account: Account | null) => Promise<AccountProviderState>;
    setYear: (year: string) => void;
}

type AccountReducerAction =
    | { type: "set"; payload: AccountProviderState }
    | { type: "year"; payload: string }
    | { type: "clear" };

const accountProviderInitialState: AccountProviderState = {
    startYear: DateTime.now().startOf("year").toISO(),
    endYear: DateTime.now().endOf("year").toISO(),
    currentYear: DateTime.now().endOf("year").toISO(),
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
    const startYear = stats.startAt
        ? DateTime.fromISO(stats.startAt)
        : DateTime.now().startOf("year");
    const endYear = stats.endAt
        ? DateTime.fromISO(stats.endAt)
        : DateTime.now().endOf("year");

    const years = [];

    let year = DateTime.fromJSDate(startYear.toJSDate());
    while (year.year <= endYear.year) {
        years.push(year.toISO() || "");
        year = year.plus({ years: 1 });
    }

    return {
        account,
        startYear: startYear.toISO() || "",
        currentYear: endYear.toISO() || "",
        endYear: endYear.toISO() || "",
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

    const setYear = (year: string) => {
        dispatch({ type: "year", payload: year });
    };

    console.log("rendering account provider");

    return (
        <AccountContext.Provider value={{ ...state, setAccount, setYear }}>
            {children}
        </AccountContext.Provider>
    );
}
