import { Account, AccountFormState } from "@/types/Account";
import webApi from "./webApi";
import { Transaction } from "@/types/Account/Transaction";
import {
    Category,
    CategoryFormState,
    CategoryRule,
    CategoryRuleFormState,
} from "@/types/Statement";

export default class AccountService {
    static create(data: AccountFormState) {
        return webApi.post<Account>("/account", data).then((res) => res.data);
    }
    static list() {
        return webApi.get<Account[]>("/account").then((res) => res.data);
    }
    static get(accountId: number) {
        return webApi
            .get<Account>(`/account/${accountId}`)
            .then((res) => res.data);
    }

    static getTransactions(accountId: number) {
        return webApi
            .get<(Transaction & { amount: string })[]>(
                `/account/${accountId}/transaction`
            )
            .then((res) =>
                res.data.map(
                    (t) =>
                        ({ ...t, amount: parseFloat(t.amount) } as Transaction)
                )
            );
    }

    static getCategories(accountId: number) {
        return webApi
            .get<Category[]>(`/account/${accountId}/category`)
            .then((res) => res.data);
    }

    static createCategory(accountId: number, data: CategoryFormState) {
        return webApi
            .post<Category>(`/account/${accountId}/category`, data)
            .then((res) => res.data);
    }

    static deleteCategory(accountId: number, categoryId: number) {
        return webApi
            .delete(`/account/${accountId}/category/${categoryId}`)
            .then((res) => res.data);
    }

    static updateCategory(
        accountId: number,
        categoryId: number,
        data: CategoryFormState
    ) {
        return webApi
            .put<Category>(`/account/${accountId}/category/${categoryId}`, data)
            .then((res) => res.data);
    }

    static getCategoryTransactions(categoryId: number) {
        return webApi
            .get<Transaction[]>(`/category/${categoryId}/transaction`)
            .then((res) => res.data);
    }

    static getCategoryRules(categoryId: number) {
        return webApi
            .get<CategoryRule[]>(`/category/${categoryId}/rule`)
            .then((res) => res.data);
    }

    static createCategoryRule(categoryId: number, data: CategoryRuleFormState) {
        return webApi
            .post<CategoryRule>(`/category/${categoryId}/rule`, data)
            .then((res) => res.data);
    }

    static updateCategoryRule(
        categoryId: number,
        ruleId: number,
        data: CategoryRuleFormState
    ) {
        return webApi
            .put<CategoryRule>(`/category/${categoryId}/rule/${ruleId}`, data)
            .then((res) => res.data);
    }

    static deleteCategoryRule(categoryId: number, ruleId: number) {
        return webApi
            .delete(`/category/${categoryId}/rule/${ruleId}`)
            .then((res) => res.data);
    }
}
