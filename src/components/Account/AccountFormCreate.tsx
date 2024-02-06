"use client";

import { Account, AccountFormState } from "@/types/Account";
import AccountForm from "./AccountForm";
import AccountService from "@/services/AccountService";

export default function AccountFormCreate() {
  const onSubmit = async (data: AccountFormState) => {
    return AccountService.create(data);
  };
  const onSuccess = (account: Account) => {
    console.log("success!", account);
  };

  return <AccountForm onSubmit={onSubmit} onSuccess={onSuccess} />;
}
