import { getSessionUser } from "@/_server/actions/sessionActions";
import HomeLayout from "@/components/Layout/HomeLayout";
import { User } from "@/types/User";
import type { Metadata } from "next";
import Link from "next/link";

export function metadata(): Metadata {
  return {
    title: "Home - Budget Analyzer",
    description: "How much do you waste for no reason? Find out, now!",
  };
}

export default async function Home() {
  console.log("home page wants session");
  let user: User | undefined = undefined;
  try {
    user = (await getSessionUser()) || undefined;
  } catch {
    // no user
  }

  return (
    <HomeLayout user={user}>
      <div className="welcome w-full flex flex-col items-center justify-center h-[400px]">
        <div>
          <h2>Welcome to Budget Analyzer</h2>
        </div>
        <div>
          {!!user?.id && (
            <>
              <Link href="/dashboard" className="btn bg-sky-700">
                Dashboard
              </Link>
            </>
          )}
          {!user?.id && (
            <div className="flex gap-x-4">
              <div>
                <Link href="/login" className="btn bg-sky-700">
                  Login
                </Link>
              </div>
              <div>
                <Link href="/register" className="btn bg-sky-700">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
