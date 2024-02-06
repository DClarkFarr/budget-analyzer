import { getSessionUser } from "@/server/actions/sessionActions";

export default async function CreateAccountPage() {
  const user = (await getSessionUser())!;

  return (
    <div className="account__create">
      <h2 className="text-2xl mb-1">Create Bank Account</h2>
      <p className="mb-4">
        You can put all your banks into a single account. Or you can create an
        account for each bank account. Up to you.
      </p>
    </div>
  );
}
