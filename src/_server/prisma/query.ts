import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

export const getCurrentOrigin = () => {
    const header = headers();

    return `${header.get("x-forwarded-proto") || "http"}://${header.get(
        "host"
    )}`;
};

export const useCacheQuery = <
    V extends any,
    F extends (value: any) => V = (value: any) => V
>(
    url: string,
    data?: object | null,
    callback?: F | null,
    key: string | string[] = url
) => {
    const parsedUrl = new URL(url, getCurrentOrigin());
    if (data) {
        for (let [key, value] of Object.entries(data)) {
            parsedUrl.searchParams.append(key, value);
        }
    }

    const query = async () => {
        return fetch(parsedUrl.toString(), {
            next: { tags: Array.isArray(key) ? key : [key] },
        })
            .then((res) => res.json())
            .then((value) => {
                if (typeof callback === "function") {
                    return callback(value);
                }
                return value as V;
            });
    };

    const clear = async (key: string | string[]) => {
        "use server";
        if (Array.isArray(key)) {
            for (let k of key) {
                revalidateTag(k);
            }
        } else {
            revalidateTag(key);
        }
    };

    return { query, clear: clear.bind(null, key) };
};
