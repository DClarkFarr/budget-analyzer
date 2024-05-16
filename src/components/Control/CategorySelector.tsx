import useCategoriesQuery from "@/hooks/useCategoriesQuery";
import { Category } from "@/types/Statement";
import { useMemo } from "react";
import Select, { SingleValue } from "react-select";
export function CategorySelector({
    accountId,
    year,
    selectedId,
    onSelect,
}: {
    accountId: number;
    year: number;
    selectedId?: number;
    onSelect: (categoryId: number | null, category: Category | null) => void;
}) {
    const { categories, isLoading } = useCategoriesQuery(accountId, year);

    const options = useMemo(() => {
        return categories.map((category) => ({
            value: category.id,
            label: category.name,
        }));
    }, [categories]);

    if (isLoading) {
        return <div>Loading categories...</div>;
    }

    const onChange = (
        newValue: SingleValue<{
            value: number;
            label: string;
        }>
    ) => {
        const found = categories.find((c) => c.id === newValue?.value)!;
        onSelect(newValue?.value || null, found);
    };

    return (
        <Select
            className="w-[250px]"
            options={options}
            defaultValue={options.find((o) => o.value === selectedId)}
            isClearable
            isSearchable
            placeholder="Select category..."
            onChange={onChange}
        />
    );
}
