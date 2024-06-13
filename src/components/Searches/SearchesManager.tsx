"use client";

export default function SearchesManager({ accountId }: { accountId: number }) {
    return (
        <div className="pt-8">
            <h1 className="text-2xl mb-4">Searches Manager</h1>
            <div className="flex w-100 align-stretch">
                <div className="shrink sidebar w-[350px] bg-gray-100 p-4"></div>
                <div className="grow w-100 content p-4 min-h-[500px]">
                    do stuff
                </div>
            </div>
        </div>
    );
}
