import AccountService from "@/services/AccountService";
import {
    AccountSearchContentItem,
    AccountSearchSerialized,
} from "@/types/Account/Searches";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import FormError from "../Form/FormError";
import { Category } from "@/types/Statement";
import { FaTimes } from "react-icons/fa";
import { debounce } from "lodash-es";
import Select, { SingleValue } from "react-select";

type SearchData = Parameters<typeof AccountService.updateSearchValues>[2];

function BaseGroup({
    index,
    contentGroup,
    children,
    onClickDelete,
}: {
    index: number;
    onClickDelete: (index: number) => void;
    contentGroup: AccountSearchContentItem;
    children: React.ReactNode;
}) {
    return (
        <div className={`group group--${contentGroup.type} p-2 bg-stone-300`}>
            <div className="w-full flex gap-x-4 items-center">
                <div className="shrink">
                    <label className="text-uppercase whitespace-nowrap">
                        {contentGroup.type}
                    </label>
                </div>
                <div className="grow w-full">{children}</div>
                <div className="shrink">
                    <button
                        className="btn btn-danger"
                        onClick={() => onClickDelete(index)}
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        </div>
    );
}

function TextGroup({
    index,
    contentGroup,
    onDelete,
    onUpdate,
}: {
    index: number;
    contentGroup: AccountSearchContentItem;
    onDelete: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
}) {
    const [text, setText] = useState(contentGroup.value);

    console.log("rendering with text", text);

    const handleTextChange = (value: string) => {
        setText(value);
    };

    const throttledUpdate = useMemo(() => {
        return debounce((t: string) => {
            return onUpdate(index, t);
        }, 500);
    }, []);

    useEffect(() => {
        if (text.length > 1) {
            throttledUpdate(text);
        }
    }, [text]);
    return (
        <BaseGroup
            index={index}
            contentGroup={contentGroup}
            onClickDelete={onDelete}
        >
            <input
                type="text"
                className="form-control"
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
            />
        </BaseGroup>
    );
}

function CategoryGroup({
    index,
    contentGroup,
    categories,
    onDelete,
    onUpdate,
}: {
    index: number;
    contentGroup: AccountSearchContentItem;
    categories: Category[];
    onDelete: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
}) {
    const [category, setCategory] = useState<Category | null>(null);

    const onSelectCategory = (newValue: SingleValue<Category>) => {
        if (newValue) {
            setCategory(newValue);
        }
    };

    useEffect(() => {
        if (category) {
            onUpdate(index, category ? String(category.id) : "");
        }
    }, [category]);

    useEffect(() => {
        const id = Number(contentGroup.value);
        const c = categories.find((c) => c.id === id);
        setCategory(c || null);
    }, [categories, category]);

    return (
        <BaseGroup
            index={index}
            contentGroup={contentGroup}
            onClickDelete={onDelete}
        >
            <Select
                className="w-full"
                options={categories}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id.toString()}
                value={category}
                isSearchable
                placeholder="Select a category..."
                onChange={onSelectCategory}
            />
        </BaseGroup>
    );
}

export default function SearchItemManager({
    item,
    update,
    categories,
}: {
    item: AccountSearchSerialized;
    categories: Category[];
    update: (searchId: number, data: SearchData) => Promise<string | null>;
}) {
    const [startAt, setStartAt] = useState<string>(
        item.startAt
            ? DateTime.fromISO(item.startAt).toFormat("yyyy-MM-dd")
            : ""
    );
    const [endAt, setEndAt] = useState<string>(
        item.endAt ? DateTime.fromISO(item.endAt).toFormat("yyyy-MM-dd") : ""
    );

    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const onChangeDate = async (key: "startAt" | "endAt", value: string) => {
        const d = DateTime.fromSQL(value);
        if (!d.isValid) {
            return;
        }

        if (key === "startAt") {
            setStartAt(d.toFormat("yyyy-MM-dd"));
        } else if (key === "endAt") {
            setEndAt(d.toFormat("yyyy-MM-dd"));
        }

        handleUpdate({ [key]: d.toISO() });
    };

    const handleUpdate = async (data: SearchData) => {
        setIsSaving(true);
        setErrorMessage("");

        try {
            const error = await update(item.id, data);
            if (error) {
                setErrorMessage(error);
            }
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        }

        setIsSaving(false);
    };

    const onAddTextFilter = () => {
        const content = [...item.content];
        content.push({ type: "text", value: "" });
        handleUpdate({ content });
    };
    const onAddCategoryFilter = () => {
        const content = [...item.content];
        content.push({ type: "category", value: "" });
        handleUpdate({ content });
    };

    const onDeleteGroup = (index: number) => {
        const content = [...item.content];
        content.splice(index, 1);
        handleUpdate({ content });
    };

    const onUpdateGroup = (index: number, value: string) => {
        const content = [...item.content];

        const group = content[index];

        if (Array.isArray(group)) {
            return;
        }
        group.value = value;

        handleUpdate({ content });
    };

    return (
        <div>
            <h3 className="text-lg mb-3 font-semibold">{item.name}</h3>
            {isSaving && <div className="mb-4">Saving...</div>}
            {errorMessage && !isSaving && (
                <div className="mb-4">
                    <FormError message={errorMessage} />
                </div>
            )}
            <div className="flex dates gap-x-4 mb-4">
                <div>
                    <label>Start Date (Optional)</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startAt}
                        onChange={(e) =>
                            onChangeDate("startAt", e.target.value)
                        }
                    />
                </div>
                <div>
                    <label>End Date (Optional)</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endAt}
                        onChange={(e) => onChangeDate("endAt", e.target.value)}
                    />
                </div>
            </div>
            <div className="mb-4 flex gap-x-4 items-center">
                <div>Add filter:</div>
                <div>
                    <button
                        className="btn btn-primary"
                        onClick={() => onAddTextFilter()}
                    >
                        Text
                    </button>
                </div>
                <div>
                    <button
                        className="btn btn-primary"
                        onClick={() => onAddCategoryFilter()}
                    >
                        Category
                    </button>
                </div>
            </div>

            {item.content.length > 0 && (
                <div className="mb-4 bg-stone-100 p-4">
                    <div className="text-gray-700 font-semibold mb-2">
                        Filters
                    </div>
                    <div className="w-full flex flex-col gap-y-4">
                        {item.content.map((c, i) => {
                            if (Array.isArray(c)) {
                                return (
                                    <div key={i}>You have hit recursion!</div>
                                );
                            }
                            if (c.type === "category") {
                                return (
                                    <CategoryGroup
                                        key={i}
                                        index={i}
                                        contentGroup={c}
                                        categories={categories}
                                        onDelete={onDeleteGroup}
                                        onUpdate={onUpdateGroup}
                                    />
                                );
                            }

                            return (
                                <TextGroup
                                    key={i}
                                    index={i}
                                    contentGroup={c}
                                    onDelete={onDeleteGroup}
                                    onUpdate={onUpdateGroup}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
