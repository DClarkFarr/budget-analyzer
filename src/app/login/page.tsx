import LoginLayout from "@/components/Layout/LoginLayout";
import LoginForm from "@/components/User/LoginForm";
import { getIronSessionInstance } from "@/server/methods/session";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export function metadata(): Metadata {
  return {
    title: "Login - Budget Analyzer",
    description: "Enter your account easily",
  };
}

export default async function RegisterPage() {
  const session = await getIronSessionInstance();

  if (session.user?.id) {
    return redirect("/account");
  }

  return (
    <LoginLayout>
      <div className="register-page">
        <h1 className="mb-3 text-lg font-bold">Log in here!</h1>
        <LoginForm redirect={"/account"} />
      </div>
    </LoginLayout>
  );
}
