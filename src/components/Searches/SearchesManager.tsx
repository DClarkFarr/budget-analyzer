"use client";

import useAccountSearchesQuery from "@/hooks/useAccountSearchesQuery";

export default function SearchesManager({ accountId }: { accountId: number }) {
    const { searches, isLoading } = useAccountSearchesQuery({ accountId });
    return (
        <div className="pt-8">
            <h1 className="text-2xl mb-4">Searches Manager</h1>
            <div className="flex w-100 align-stretch">
                <div className="shrink sidebar w-[350px] bg-gray-100 p-4">
                    {isLoading ? (
                        <div>Is Loading...</div>
                    ) : (
                        <div>Gimme the list!</div>
                    )}
                </div>
                <div className="grow w-100 content p-4 min-h-[500px]">
                    do stuff
                </div>
            </div>
        </div>
    );
}
