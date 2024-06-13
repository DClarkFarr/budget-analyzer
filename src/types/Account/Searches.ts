export enum ACCOUNT_SEARCH_TYPES {
    category = "category",
    search = "search",
}

export type AccountSearchType = keyof typeof ACCOUNT_SEARCH_TYPES;

export type AccountSearchContentItem = {
    type: AccountSearch;
    value: string;
};

export type AccountSearchContent = (
    | AccountSearchContentItem
    | AccountSearchContentItem[]
)[];
export type AccountSearch<C = string> = {
    id: number;
    userId: number;
    accountId: number;
    name: string;
    content: C;
    createdAt: string;
};

export type AccountSearchRaw = AccountSearch;
export type AccountSearchSerialized = AccountSearch<AccountSearchContent>;
