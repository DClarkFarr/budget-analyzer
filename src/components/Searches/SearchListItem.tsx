import { SearchSerialized } from "@/types/Searches";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { FaArrowRight } from "react-icons/fa";

export default function SearchListItem({
    item,
    active,
    onClick,
}: {
    item: SearchSerialized;
    onClick: (item: SearchSerialized) => void;
    active?: boolean;
}) {
    const activeState = useMemo(() => {
        return active
            ? "bg-sky-300 hover:bg-sky-400"
            : `bg-gray-100  hover:bg-sky-100`;
    }, [active]);
    return (
        <div
            className={`flex justify-between gap-x-3 items-center p-4 my-2 rounded-md cursor-pointer ${activeState}`}
            onClick={() => onClick(item)}
        >
            <div>
                <h3 className="text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">
                    {DateTime.fromISO(item.createdAt).toFormat("DD")}
                </p>
            </div>
            <div>
                <button className="btn btn-sm btn-link text-gray-600">
                    <FaArrowRight />
                </button>
            </div>
        </div>
    );
}
