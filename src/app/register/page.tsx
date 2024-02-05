import LoginLayout from "@/components/Layout/LoginLayout";
import RegisterForm from "@/components/User/RegisterForm";
import { getIronSessionInstance } from "@/server/methods/session";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export function metadata(): Metadata {
  return {
    title: "Register - Budget Analyzer",
    description: "Create your account easily",
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
        <h1 className="mb-3 text-lg font-bold">Create a "free" account</h1>
        <RegisterForm redirect={"/account"} />
      </div>
    </LoginLayout>
  );
}
