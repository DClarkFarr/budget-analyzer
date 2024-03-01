import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function useQueryParams() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const query = useMemo(() => {
        const params = Array.from(searchParams.entries());
        const result: Record<string, string> = {};

        for (const [key, value] of params) {
            result[key] = value;
        }

        return result;
    }, [searchParams]);

    const buildParams = (params: Record<string, string | number | boolean>) => {
        const newParams = new URLSearchParams(searchParams);
        for (const key in params) {
            newParams.set(key, params[key].toString());
        }
        return newParams;
    };

    const pushQuery = (params: Record<string, string | number | boolean>) => {
        const toSet = buildParams(params);

        router.push(pathname + (toSet.size > 0 ? "?" + toSet.toString() : ""));
    };

    const redirect = (
        path: string,
        params: Record<string, string | number | boolean> = {}
    ) => {
        const toSet = buildParams(params);
        router.push(path + (toSet.size > 0 ? "?" + toSet.toString() : ""));
    };

    return {
        pushQuery,
        redirect,
        query,
    };
}
