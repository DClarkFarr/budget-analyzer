import { getSessionUser } from "@/server/actions/sessionActions";
import LogoutButton from "@/components/User/LogoutButton";

export default async function AccountPage() {
  console.log("account page wants session");
  const user = (await getSessionUser())!;

  return (
    <>
      <div>You made it to account, {user.name}</div>
      <div>
        <LogoutButton />
      </div>
    </>
  );
}
