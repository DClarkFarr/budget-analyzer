"use client";

import useAccountSearchesQuery from "@/hooks/useAccountSearchesQuery";
import CreateSearchForm from "../Control/CreateSearchForm";
import SearchListItem from "./SearchListItem";
import { AccountSearchSerialized } from "@/types/Account/Searches";
import useQueryParams from "@/hooks/useQueryParams";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SearchItemManager from "./SearchItemManager";
import useCategoriesQuery from "@/hooks/useCategoriesQuery";

export default function SearchesManager({ accountId }: { accountId: number }) {
    const { searches, isLoading, createSearch, updateSearch } =
        useAccountSearchesQuery({
            accountId,
        });

    const [selectedSearchId, setSelectedSearchId] = useState<number | null>(
        null
    );

    const { categories } = useCategoriesQuery(accountId, null);

    const { pushQuery } = useQueryParams();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("searchId")) {
            setSelectedSearchId(Number(searchParams.get("searchId")));
        }
    }, []);

    const selectedSearch = useMemo(() => {
        if (!selectedSearchId) {
            return null;
        }
        return searches.find((s) => s.id === selectedSearchId);
    }, [selectedSearchId, searches]);

    const onSubmitSearchForm = async (input: string) => {
        const created = await createSearch(input);
        if (!created) {
            return "Failed to create search";
        }

        return null;
    };

    const onSelectSearch = (item: AccountSearchSerialized) => {
        pushQuery({ searchId: item.id });
        setSelectedSearchId(item.id);
    };

    const handleUpdateSearch = async (
        searchId: number,
        data: Partial<
            Pick<
                AccountSearchSerialized,
                "startAt" | "endAt" | "content" | "excludeIds"
            >
        >
    ) => {
        try {
            await updateSearch(searchId, data);
        } catch (err) {
            if (err instanceof Error) {
                return err.message;
            }
        }

        return null;
    };

    return (
        <div className="pt-8">
            <h1 className="text-2xl mb-4">Searches Manager</h1>
            <div className="mb-4">
                <CreateSearchForm submit={onSubmitSearchForm} />
            </div>
            <div className="flex w-100 align-stretch">
                <div className="shrink sidebar w-[350px] bg-gray-100 p-4 divide-y">
                    {!isLoading &&
                        searches.map((search) => (
                            <SearchListItem
                                key={search.id}
                                item={search}
                                active={search.id === selectedSearchId}
                                onClick={onSelectSearch}
                            />
                        ))}
                </div>
                <div className="grow w-100 content p-4 min-h-[500px]">
                    {selectedSearch && (
                        <SearchItemManager
                            key={selectedSearch.id}
                            categories={categories}
                            item={selectedSearch}
                            update={handleUpdateSearch}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
