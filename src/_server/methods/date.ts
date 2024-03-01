import { DateTime } from "luxon";

export type DateTypes = DateTime | DateTime<true> | Date | string;

export function toLuxonDate(date: DateTypes) {
    console.log("got date", date);

    if (typeof date === "string") {
        return DateTime.fromISO(date);
    }
    if (date instanceof Date) {
        return DateTime.fromJSDate(date);
    }
    if (date instanceof DateTime) {
        return date;
    }

    throw new Error("Invalid date: " + date);
}

export function getMinDate(...dates: (DateTypes | undefined)[]) {
    const mapped = dates.filter((d) => !!d).map((d) => toLuxonDate(d!));

    return mapped.reduce((min, d) => (d < min ? d : min));
}

export function getMaxDate(...dates: (DateTypes | undefined)[]) {
    const mapped = dates.filter((d) => !!d).map((d) => toLuxonDate(d!));

    return mapped.reduce((max, d) => (d > max ? d : max));
}
