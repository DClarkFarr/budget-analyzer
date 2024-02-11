import { Category } from "@/types/Statement";
import { MiddlewareCallback } from "../methods/router/chainMiddleware";
import { IronSessionRequestUser } from "../methods/session";
import { getCategory } from "../prisma/account/category.methods";

export type IsUserCategoryMiddleware = IronSessionRequestUser & {
    category: Category;
};

export const isUserCategoryMiddleware: (
    categoryIdPath?: string
) => MiddlewareCallback<IsUserCategoryMiddleware> =
    (categoryIdPath = "categoryId") =>
    async (req, res, next) => {
        if (!req.session) {
            return next(new Error("No session"));
        }

        if (!req.session.user) {
            return next(new Error("No user"));
        }

        const categoryId = (res as any).params?.[categoryIdPath];

        if (!categoryId) {
            return next(new Error("No categoryId"));
        }

        const category = await getCategory(parseInt(categoryId));

        if (!category) {
            return next(new Error("Category not found"));
        }

        if (category.userId !== req.session.user.id) {
            return next(new Error("Category not owned by user"));
        }

        Object.assign(req, { category });

        next();
    };
