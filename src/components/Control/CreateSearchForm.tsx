import { useEffect, useMemo, useState } from "react";
import FormError from "../Form/FormError";

export default function CreateSearchForm({
    submit,
}: {
    submit: (input: string) => Promise<string | null>;
}) {
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);

    const disabled = useMemo(() => {
        return busy || !input || input.length < 4;
    }, [input, busy]);

    const [dirty, setDirty] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (dirty) {
            setError(
                input.length >= 3
                    ? null
                    : "Search must be at least 3 characters"
            );
        }
    }, [input, dirty]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setDirty(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setError(null);
        setBusy(true);
        try {
            const res = await submit(input);
            if (res) {
                setError(res);
            } else {
                setInput("");
                setDirty(false);
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
        }
        setBusy(false);
    };

    return (
        <form className="create-search-form" onSubmit={(e) => handleSubmit(e)}>
            <div className="lg:flex gap-x-4">
                <div className="grow lg:w-2/3">
                    <input
                        value={input}
                        placeholder="Business Expenses, kids, etc"
                        className="form-control"
                        onChange={(e) => handleChange(e)}
                    />
                    {error && <FormError message={error} />}
                </div>
                <div className="shrink lg:w-1/3">
                    <button className="btn btn-primary" disabled={disabled}>
                        {busy ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </form>
    );
}
