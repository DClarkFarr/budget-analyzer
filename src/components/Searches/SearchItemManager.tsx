import { SearchContentItem, SearchSerialized } from "@/types/Searches";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import FormError from "../Form/FormError";
import { Category, WithAccountJoin } from "@/types/Statement";
import { FaTimes, FaCheck, FaSquare } from "react-icons/fa";
import { debounce, throttle } from "lodash-es";
import Select, {
    OptionProps,
    SingleValue,
    SingleValueProps,
    components,
} from "react-select";
import useSearchQuery from "@/hooks/useSearchQuery";
import TransactionSearchTable from "../Statement/TransactionSearchTable";
import SearchService from "@/services/SearchService";

type SearchData = Parameters<typeof SearchService.updateSearchValues>[1];

function BaseGroup({
    index,
    contentGroup,
    children,
    selected,
    onToggle,
    onClickDelete,
}: {
    index: number;
    contentGroup: SearchContentItem;
    children: React.ReactNode;
    selected: boolean;
    onToggle: (index: number, show: boolean) => void;
    onClickDelete: (index: number) => void;
}) {
    return (
        <div className={`group group--${contentGroup.type} p-2 bg-stone-300`}>
            <div className="w-full flex gap-x-4 items-center">
                <div className="shrink">
                    <button
                        className="btn btn-sm bg-stone-600"
                        onClick={() => onToggle(index, !selected)}
                    >
                        {selected ? <FaCheck /> : <FaSquare />}
                    </button>
                </div>
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
    selected,
    onToggle,
    onDelete,
    onUpdate,
}: {
    index: number;
    contentGroup: SearchContentItem;
    selected: boolean;
    onToggle: (index: number, show: boolean) => void;
    onDelete: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
}) {
    const [text, setText] = useState(contentGroup.value);

    const handleTextChange = (value: string) => {
        setText(value);
    };

    const throttledUpdate = useMemo(() => {
        return debounce((t: string) => {
            return onUpdate(index, t);
        }, 500);
    }, []);

    useEffect(() => {
        if (text.length > 1 && text !== contentGroup.value) {
            throttledUpdate(text);
        }
    }, [text]);
    return (
        <BaseGroup
            index={index}
            contentGroup={contentGroup}
            onClickDelete={onDelete}
            selected={selected}
            onToggle={onToggle}
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
    selected,
    onToggle,
    onDelete,
    onUpdate,
}: {
    index: number;
    contentGroup: SearchContentItem;
    categories: WithAccountJoin<Category>[];
    selected: boolean;
    onToggle: (index: number, show: boolean) => void;
    onDelete: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
}) {
    const [category, setCategory] = useState<WithAccountJoin<Category> | null>(
        null
    );
    const [categoryLoaded, setCategoryLoaded] = useState(false);

    const onSelectCategory = (
        newValue: SingleValue<WithAccountJoin<Category>>
    ) => {
        if (newValue) {
            setCategory(newValue);
        }
    };

    useEffect(() => {
        if (category) {
            if (!categoryLoaded) {
                setCategoryLoaded(true);
            } else {
                onUpdate(index, category ? String(category.id) : "");
            }
        }
    }, [category]);

    useEffect(() => {
        const id = Number(contentGroup.value);
        const c = categories.find((c) => c.id === id);
        setCategory(c || null);
    }, [categories, category]);

    const CustomSingleValue = ({
        children,
        ...props
    }: SingleValueProps<WithAccountJoin<Category>>) => (
        <components.SingleValue {...props}>
            <div
                className="option px-2 py-1 hover:bg-gray-100 cursor-pointer"
                {...props.innerProps}
            >
                <div className="option__heading text-xs">
                    {props.data.accountName}
                </div>
                <div className="option__label">{children}</div>
            </div>
        </components.SingleValue>
    );

    const CustomOption = ({
        children,
        ...props
    }: OptionProps<WithAccountJoin<Category>>) => (
        <components.Option {...props}>
            <div className="option" {...props.innerProps}>
                <div className="option__heading text-xs">
                    {props.data.accountName}
                </div>
                <div className="option__label">{children}</div>
            </div>
        </components.Option>
    );

    return (
        <BaseGroup
            index={index}
            contentGroup={contentGroup}
            selected={selected}
            onToggle={onToggle}
            onClickDelete={onDelete}
        >
            <Select
                className="w-full"
                options={categories}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id.toString()}
                value={category}
                isMulti={false}
                isSearchable
                placeholder="Select a category..."
                components={{
                    SingleValue: CustomSingleValue,
                    Option: CustomOption,
                }}
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
    item: SearchSerialized;
    categories: WithAccountJoin<Category>[];
    update: (searchId: number, data: SearchData) => Promise<string | null>;
}) {
    const {
        transactions,
        isLoading,
        refetch: refetchQuery,
    } = useSearchQuery({ searchId: item.id });

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

    const [unselectedFilters, setSelectedFilters] = useState<number[]>([]);

    const visibleFilters = useMemo(() => {
        return transactions.reduce((acc, t) => {
            t.foundbyFilters.forEach((index) => {
                if (
                    !acc.includes(index) &&
                    !unselectedFilters.includes(index)
                ) {
                    acc.push(index);
                }
            });

            return acc;
        }, [] as number[]);
    }, [transactions, unselectedFilters]);

    const throttledReSearch = useMemo(() => {
        return throttle(() => refetchQuery(), 500);
    }, []);

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

        throttledReSearch();
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
        throttledReSearch();
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

    const onToggleFilter = (index: number, show: boolean) => {
        if (show) {
            setSelectedFilters(unselectedFilters.filter((f) => f !== index));
        } else if (!unselectedFilters.includes(index)) {
            setSelectedFilters([...unselectedFilters, index]);
        }
    };

    const onToggleSelectedTransaction = (id: number, excluded: boolean) => {
        if (excluded && !item.excludeIds.includes(id)) {
            const excludeIds = [...item.excludeIds, id];
            handleUpdate({ excludeIds });
        } else if (!excluded && item.excludeIds.includes(id)) {
            const excludeIds = item.excludeIds.filter((i) => i !== id);
            handleUpdate({ excludeIds });
        }
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
                                        selected={visibleFilters.includes(i)}
                                        contentGroup={c}
                                        categories={categories}
                                        onToggle={onToggleFilter}
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
                                    selected={visibleFilters.includes(i)}
                                    onToggle={onToggleFilter}
                                    onDelete={onDeleteGroup}
                                    onUpdate={onUpdateGroup}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {!isLoading && transactions.length > 0 && (
                <>
                    <TransactionSearchTable
                        excludedTransactionIds={item.excludeIds}
                        visibleFilters={visibleFilters}
                        transactions={transactions}
                        onToggleExcluded={onToggleSelectedTransaction}
                    />
                </>
            )}
        </div>
    );
}
