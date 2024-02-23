"use client";

import { Account, AccountFormState } from "@/types/Account";
import AccountForm from "./AccountForm";
import AccountService from "@/services/AccountService";
import { useRouter } from "next/navigation";

export default function AccountFormCreate() {
  const router = useRouter();

  const onSubmit = async (data: AccountFormState) => {
    return AccountService.create(data);
  };
  const onSuccess = () => {
    router.push("/dashboard");
  };

  return <AccountForm onSubmit={onSubmit} onSuccess={onSuccess} />;
}
