import { Account, AccountFormState } from "@/types/Account";
import webApi from "./webApi";
import {
    AccountTransactionsTotal,
    Transaction,
    WithCategories,
} from "@/types/Account/Transaction";
import {
    Category,
    CategoryFormState,
    CategoryRule,
    CategoryRuleFormState,
} from "@/types/Statement";
import { SearchSerialized } from "@/types/Searches";

export default class AccountService {
    static create(data: AccountFormState) {
        return webApi.post<Account>("/account", data).then((res) => res.data);
    }
    static list() {
        return webApi.get<Account[]>("/account").then((res) => res.data);
    }
    static accountsStats() {
        return webApi
            .get<Record<number, AccountTransactionsTotal>>("/account/stats")
            .then((res) => res.data);
    }

    static getAccountStats(accountId: number) {
        return webApi
            .get<AccountTransactionsTotal>(`/account/${accountId}/stats`)
            .then((res) => res.data);
    }

    static get(accountId: number) {
        return webApi
            .get<Account>(`/account/${accountId}`)
            .then((res) => res.data);
    }

    static getTransactions<WC extends boolean>(
        accountId: number,
        options: { withCategories: WC; year?: number } = {
            withCategories: false as WC,
        }
    ) {
        type Response = WC extends true
            ? WithCategories<Transaction>
            : Transaction;

        return webApi
            .get<Response[]>(`/account/${accountId}/transaction`, {
                params: options,
            })
            .then((res) => res.data);
    }

    static getUncategorizedTransactions(
        accountId: number,
        options: { year?: number } = {}
    ) {
        return webApi
            .get<WithCategories<Transaction>[]>(
                `/account/${accountId}/transaction/uncategorized`,
                { params: options }
            )
            .then((res) => res.data);
    }

    static getDuplicateTransactions(
        accountId: number,
        options: { year?: number } = {}
    ) {
        return webApi
            .get<(Transaction & { categories: Category[] })[]>(
                `/account/${accountId}/transaction/duplicate`,
                { params: options }
            )
            .then((res) => res.data);
    }

    static getCategories(accountId: number, options: { year?: number }) {
        return webApi
            .get<Category[]>(`/account/${accountId}/category`, {
                params: options,
            })
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

    static getCategoryTransactions(
        categoryId: number,
        options: { year?: number } = {}
    ) {
        return webApi
            .get<Transaction[]>(`/category/${categoryId}/transaction`, {
                params: options,
            })
            .then((res) => res.data);
    }

    static syncCategoryTransactions(categoryId: number) {
        return webApi
            .post(`/category/${categoryId}/transaction/sync`)
            .then((res) => res.data)
            .then(() => {});
    }

    static getCategoriesTotals<K extends number>(
        categoryIds: K[],
        year: number
    ) {
        return webApi
            .get<{
                [ID in K]: {
                    incoming: number;
                    outgoing: number;
                    net: number;
                    count: number;
                };
            }>(`/category/total`, {
                params: { categoryIds: categoryIds.join(","), year },
            })
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

    static moveTransactionToCategory(
        categoryId: number,
        transactionId: number
    ) {
        return webApi
            .post(`/category/${categoryId}/transaction`, { transactionId })
            .then((res) => res.data);
    }
}
