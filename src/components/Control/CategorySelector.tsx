import useCategoriesQuery from "@/hooks/useCategoriesQuery";
import { useMemo } from "react";
import Select, { SingleValue } from "react-select";
export function CategorySelector({
    accountId,
    onSelect,
}: {
    accountId: number;
    onSelect: (categoryId: number | null) => void;
}) {
    const { categories, isLoading } = useCategoriesQuery(accountId);

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
        onSelect(newValue?.value || null);
    };

    return (
        <Select
            className="w-[200px]"
            options={options}
            isClearable
            isSearchable
            placeholder="Select a category..."
            onChange={onChange}
        />
    );
}