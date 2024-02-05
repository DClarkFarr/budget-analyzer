// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { User } from "@/types/User";
import { getIronSession, IronSession, IronSessionOptions } from "iron-session";
import { cookies as getCookies } from "next/headers";
import cookie from "cookie";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest } from "next/server";

export const sessionOptions: IronSessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: "session_id",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};

// This is where we specify the typings of req.session.*
declare module "iron-session" {
    interface IronSessionData {
        user?: User;
    }
}

export type DynamicSegments = {
    params: { slug: string } | undefined;
};

export type RouteHandler = (
    request: NextRequest,
    routeSegment: DynamicSegments
) => Promise<Response>;

export type IronSessionRequest = NextRequest & { session: IronSession };
export type IronSessionRequestUser = IronSessionRequest & {
    session: IronSession & { user: User };
};

export type RouteHandlerWithSession = (
    request: IronSessionRequest,
    routeSegment: DynamicSegments
) => Promise<Response>;

export function getIronSessionInstance() {
    // fake request
    // to mock: res.headers.append("set-cookie", cookieValue);
    const cookies = getCookies();
    const req = {
        headers: {
            get(key: string) {
                if (key === "cookie") {
                    return cookies.toString();
                } else {
                    console.warn("Unsupported get header", key);
                }
            },
            cookie: cookies.toString(),
        },
    };

    // fake response
    // to mock: res.headers.append("set-cookie", cookieValue);
    const res = {
        headers: {
            append(key: string, val: string) {
                if (key === "set-cookie") {
                    const parsedCookies = cookie.parse(val);

                    const toSet: ResponseCookie = {
                        name: sessionOptions.cookieName,
                        value: parsedCookies[sessionOptions.cookieName],
                    };

                    const segs = val.split("; ");

                    segs.forEach((seg) => {
                        const [segKey, segVal] = seg.split("=");
                        if (segKey === "Path") {
                            toSet.path = segVal;
                        } else if (segKey === "Max-Age") {
                            toSet.maxAge = parseInt(segVal);
                        } else if (segKey === "SameSite") {
                            toSet.sameSite = segVal as any;
                        } else if (seg === "HttpOnly") {
                            toSet.httpOnly = true;
                        } else if (seg === "Secure") {
                            toSet.secure = true;
                        } else if (segKey === sessionOptions.cookieName) {
                            // do nothing
                        } else {
                            console.log("what the heck is this seg", seg);
                        }
                    });

                    cookies.set(toSet);
                } else {
                    console.warn("Unsupported set header", key, val);
                }
            },
        },
    };

    return getIronSession(
        req as unknown as Request,
        res as unknown as Response,
        sessionOptions
    );
}
