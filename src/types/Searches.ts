export enum SEARCH_TYPES {
    category = "category",
    text = "text",
}

export type SearchType = keyof typeof SEARCH_TYPES;

export type SearchContentItem = {
    type: SearchType;
    value: string;
};

export type SearchContent = (SearchContentItem | SearchContentItem[])[];
export type BaseSearch<C = string, E = string> = {
    id: number;
    userId: number;
    name: string;
    content: C;
    startAt: string | null;
    endAt: string | null;
    excludeIds: E;
    createdAt: string;
};

export type SearchRaw = BaseSearch;
export type SearchSerialized = BaseSearch<SearchContent, number[]>;
