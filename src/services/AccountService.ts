import { Account, AccountFormState } from "@/types/Account";
import webApi from "./webApi";

export default class AccountService {
  static create(data: AccountFormState) {
    return webApi.post<Account>("/account", data).then((res) => res.data);
  }
}
