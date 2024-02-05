"use client";

import { destroySession } from "@/_server/actions/sessionActions";
import { useRouter } from "next/navigation";

export default function LogoutButtion() {
  const { push } = useRouter();
  const onClickLogout = async () => {
    destroySession();
    push("/login");
  };

  return (
    <button className="btn bg-red-700" onClick={onClickLogout}>
      Logout
    </button>
  );
}
