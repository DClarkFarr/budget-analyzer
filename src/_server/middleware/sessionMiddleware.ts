import { MiddlewareCallback } from "@/server/methods/router/chainMiddleware";
import {
    IronSessionRequest,
    IronSessionRequestUser,
    getIronSessionInstance,
} from "@/server/methods/session";
import { User } from "@/types/User";

export const startSessionMiddleware: () => MiddlewareCallback<IronSessionRequest> =
    () => async (req, res, next) => {
        const session = await getIronSessionInstance();

        Object.assign(req, { session });

        next();
    };

export const hasUserMiddleware: (
    role?: User["role"]
) => MiddlewareCallback<IronSessionRequestUser> =
    (role) => async (req, res, next) => {
        if (!req.session) {
            console.warn("throwing no session");
            return next(new Error("No session"));
        }

        if (!req.session.user) {
            console.warn("throwing no user");
            return next(new Error("No user"));
        }

        if (role && req.session.user.role !== role) {
            return next(new Error("Permission denied for " + role));
        }

        next();
    };
