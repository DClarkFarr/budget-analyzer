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
        router.push(buildUrl({ params }));
    };

    const buildUrl = ({
        path,
        params,
    }: {
        path?: string;
        params?: Record<string, string | number | boolean>;
    }) => {
        const q = buildParams(params || {});
        const p = path || pathname;

        return p + (q.size > 0 ? "?" + q.toString() : "");
    };

    const redirect = (
        path: string,
        params: Record<string, string | number | boolean> = {}
    ) => {
        router.push(buildUrl({ path, params }));
    };

    return {
        buildUrl,
        pushQuery,
        redirect,
        query,
    };
}
