import { SearchSerialized } from "@/types/Searches";
import webApi from "./webApi";
import {
    Transaction,
    WithCategories,
    WithFoundIndexes,
} from "@/types/Account/Transaction";
import { Category, WithAccountJoin } from "@/types/Statement";

export default class SearchService {
    static getCategories() {
        return webApi
            .get<WithAccountJoin<Category>[]>("/category")
            .then((res) => res.data);
    }

    static getSearches() {
        return webApi
            .get<SearchSerialized[]>(`/searches`)
            .then((res) => res.data);
    }

    static createSearch(name: string) {
        return webApi
            .post<SearchSerialized>(`/searches`, {
                name,
            })
            .then((res) => res.data);
    }

    static updateSearchValues(
        searchId: number,
        data: Partial<
            Pick<
                SearchSerialized,
                "content" | "startAt" | "endAt" | "excludeIds"
            >
        >
    ) {
        return webApi
            .put<SearchSerialized>(`/searches/${searchId}`, data)
            .then((res) => res.data);
    }

    static querySearch(searchId: number) {
        return webApi
            .get<WithFoundIndexes<WithCategories<Transaction>>[]>(
                `/searches/${searchId}`
            )
            .then((res) => res.data);
    }
}
