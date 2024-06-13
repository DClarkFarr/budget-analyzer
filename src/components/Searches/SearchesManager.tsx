"use client";

import useAccountSearchesQuery from "@/hooks/useAccountSearchesQuery";
import CreateSearchForm from "../Control/CreateSearchForm";
import SearchListItem from "./SearchListItem";
import { AccountSearchSerialized } from "@/types/Account/Searches";
import useQueryParams from "@/hooks/useQueryParams";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SearchesManager({ accountId }: { accountId: number }) {
    const { searches, isLoading, createSearch } = useAccountSearchesQuery({
        accountId,
    });

    const [selectedSearchId, setSelectedSearchId] = useState<number | null>(
        null
    );

    const { pushQuery } = useQueryParams();
    const params = useParams();

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

    useEffect(() => {
        if (params.searchId) {
            setSelectedSearchId(Number(params.searchId));
        }
    }, []);

    const selectedSearch = useMemo(() => {
        if (!selectedSearchId) {
            return null;
        }

        return searches.find((s) => s.id === selectedSearchId);
    }, [selectedSearchId, searches]);
    return (
        <div className="pt-8">
            <h1 className="text-2xl mb-4">Searches Manager</h1>
            <div className="mb-4">
                <CreateSearchForm submit={onSubmitSearchForm} />
            </div>
            <div className="flex w-100 align-stretch">
                <div className="shrink sidebar w-[350px] bg-gray-100 p-4 divide-y">
                    {isLoading ? (
                        <div>Loading Searches...</div>
                    ) : (
                        searches.map((search) => (
                            <SearchListItem
                                key={search.id}
                                item={search}
                                active={search.id === selectedSearchId}
                                onClick={onSelectSearch}
                            />
                        ))
                    )}
                </div>
                <div className="grow w-100 content p-4 min-h-[500px]">
                    {selectedSearch && (
                        <div>
                            <h2 className="text-xl mb-4">
                                {selectedSearch.name}
                            </h2>
                            <pre>
                                {JSON.stringify(
                                    selectedSearch.content,
                                    null,
                                    2
                                )}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
