import { DateTime } from "luxon";

type ArrayToKeys<T extends any[]> = {
    [K in T[number]]: any;
};
export default function toApiResponse<
    T extends Record<string, any>,
    F extends Record<keyof T, any> = Record<keyof T, any>,
    K = keyof T
>(
    from: F,
    {
        intKeys = [],
        floatKeys = [],
        dateKeys = [],
    }: {
        intKeys?: K[];
        dateKeys?: K[];
        floatKeys?: K[];
    }
): T {
    const ints = intKeys.reduce((acc, key) => {
        acc[key] = parseInt(from[key as keyof F]);
        return acc;
    }, {} as ArrayToKeys<typeof intKeys>);

    const dates = dateKeys.reduce((acc, key) => {
        acc[key] = DateTime.fromJSDate(from[key as keyof F]).toISO();
        return acc;
    }, {} as ArrayToKeys<typeof dateKeys>);

    const floats = floatKeys.reduce((acc, key) => {
        acc[key] = parseFloat(from[key as keyof F]);
        return acc;
    }, {} as ArrayToKeys<typeof floatKeys>);

    return { ...from, ...ints, ...dates, ...floats } as T;
}
