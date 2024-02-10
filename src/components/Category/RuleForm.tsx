import { Transaction } from "@/types/Account/Transaction";
import { CategoryRule, CategoryRuleFormState } from "@/types/Statement";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash-es";
import TransactionsTableReadonly from "./TransactionsTableReadonly";

const typeOptions = [
    {
        label: "All",
        value: "",
    },
    {
        label: "Incoming",
        value: "incoming",
    },
    {
        label: "Outgoing",
        value: "outgoing",
    },
];

export default function RuleForm({
    rule,
    buttons,
    transactions,
    onSubmit,
}: {
    rule?: CategoryRule;
    transactions: Transaction[];
    buttons: (props: { busy: boolean; disabled: boolean }) => React.ReactNode;
    onSubmit: (
        data: CategoryRuleFormState,
        extras: { reset: () => void }
    ) => Promise<void>;
}) {
    const {
        handleSubmit,
        register,
        setValue,
        reset,
        formState: { errors, isLoading, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: "",
            rule: "",
            transactionType: "",
        } as CategoryRuleFormState,
    });

    useEffect(() => {
        if (rule) {
            setValue("name", rule.name);
            setValue("rule", rule.rule);
            setValue("transactionType", rule.transactionType || "");
        }
    }, [rule]);

    const [ruleText, setRuleText] = useState(rule?.rule || "");
    const [transactionType, setTransactionType] = useState<
        CategoryRuleFormState["transactionType"]
    >(rule?.transactionType || "");
    const [showMatches, setShowMatches] = useState(false);

    const [matchedTransactions, setMatchedTransactions] = useState<number[]>(
        []
    );
    const [, startTransition] = useTransition();

    const parseRulesDebounced = useCallback(() => {
        if (!ruleText) {
            setMatchedTransactions([]);
            return;
        }

        startTransition(() => {
            setMatchedTransactions(
                transactions.reduce((acc, transaction) => {
                    var regExp = new RegExp(ruleText, "i");

                    if (
                        transactionType.length &&
                        transactionType !== transaction.expenseType
                    ) {
                        return acc;
                    }
                    if (regExp.test(transaction.description)) {
                        acc.push(transaction.id);
                    }
                    return acc;
                }, [] as number[])
            );
        });
    }, [transactions, ruleText, transactionType]);

    const resetForm = () => {
        reset();
        setRuleText("");
        setTransactionType("");
        setShowMatches(false);
    };

    const onSubmitForm = () => {
        return handleSubmit(async (data: CategoryRuleFormState) => {
            await onSubmit(data, { reset: resetForm });
        });
    };

    useEffect(() => {
        if (ruleText) {
            parseRulesDebounced();
        }
    }, [transactions, ruleText, parseRulesDebounced]);

    return (
        <div className="rule-form">
            <form
                onSubmit={onSubmitForm()}
                className="w-full flex gap-x-4 items-end mb-2"
            >
                <div className="w-1/4">
                    <label>Name</label>
                    <input
                        className="form-control"
                        type="text"
                        {...register("name", { required: true, minLength: 2 })}
                    />
                </div>
                <div className="w-1/2">
                    <label>Rule</label>
                    <input
                        className="form-control"
                        type="text"
                        onInput={(e) => setRuleText(e.currentTarget.value)}
                        {...register("rule", { required: true, minLength: 2 })}
                    />
                </div>
                <div>
                    <label>Type</label>
                    <select
                        className="form-control"
                        {...register("transactionType", {
                            onChange: (e) => {
                                setTransactionType(e.currentTarget.value);
                            },
                        })}
                    >
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="ml-auto">
                    {buttons({
                        busy: isLoading,
                        disabled: isLoading || !isValid,
                    })}
                </div>
            </form>

            <div className="flex mb-2">
                <div>
                    {ruleText.length > 0 && (
                        <p className="text-gray-600">
                            Matches {matchedTransactions.length} transactions.
                        </p>
                    )}

                    {ruleText.length === 0 && (
                        <p className="text-gray-600">Type Rule to match.</p>
                    )}
                </div>
                <div className="ml-auto">
                    <button
                        className="text-sky-600 hover:text-sky-800 hover:underline"
                        onClick={() => setShowMatches(!showMatches)}
                    >
                        {showMatches ? "Hide" : "Show"} Transactions
                    </button>
                </div>
            </div>

            {showMatches && (
                <TransactionsTableReadonly
                    transactions={transactions}
                    matchedTransactionsIds={matchedTransactions}
                />
            )}
        </div>
    );
}
