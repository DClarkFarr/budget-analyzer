import { MiddlewareCallback } from "@/server/methods/router/chainMiddleware";
import {
  IronSessionRequest,
  IronSessionRequestUser,
  getIronSessionInstance,
} from "@/server/methods/session";
import { User } from "@/types/User";

export const hasSessionMiddleware: MiddlewareCallback<
  IronSessionRequest
> = async (req, res, next) => {
  const session = await getIronSessionInstance();

  Object.assign(req, { session });

  next();
};

export const hasUserMiddleware: (
  role?: User["role"]
) => MiddlewareCallback<IronSessionRequestUser> =
  (role) => async (req, res, next) => {
    if (!req.session) {
      return next(new Error("No session"));
    }

    if (!req.session.user) {
      return next(new Error("No user"));
    }

    if (role && req.session.user.role !== role) {
      return next(new Error("Permission denied for " + role));
    }

    next();
  };
