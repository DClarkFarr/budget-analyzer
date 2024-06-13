export enum ACCOUNT_SEARCH_TYPES {
    category = "category",
    text = "text",
}

export type AccountSearchType = keyof typeof ACCOUNT_SEARCH_TYPES;

export type AccountSearchContentItem = {
    type: AccountSearchType;
    value: string;
};

export type AccountSearchContent = (
    | AccountSearchContentItem
    | AccountSearchContentItem[]
)[];
export type AccountSearch<C = string, E = string> = {
    id: number;
    userId: number;
    accountId: number;
    name: string;
    content: C;
    startAt: string | null;
    endAt: string | null;
    excludeIds: E;
    createdAt: string;
};

export type AccountSearchRaw = AccountSearch;
export type AccountSearchSerialized = AccountSearch<
    AccountSearchContent,
    number[]
>;
