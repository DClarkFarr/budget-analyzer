import { Account, AccountFormState } from "@/types/Account";
import webApi from "./webApi";
import { Transaction } from "@/types/Account/Transaction";

export default class AccountService {
  static create(data: AccountFormState) {
    return webApi.post<Account>("/account", data).then((res) => res.data);
  }
  static list() {
    return webApi.get<Account[]>("/account").then((res) => res.data);
  }
  static get(accountId: number) {
    return webApi.get<Account>(`/account/${accountId}`).then((res) => res.data);
  }

  static getTransactions(accountId: number) {
    return webApi
      .get<Transaction[]>(`/account/${accountId}/transaction`)
      .then((res) => res.data);
  }
}
