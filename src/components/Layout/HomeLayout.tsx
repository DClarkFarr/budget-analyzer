import { User } from "@/types/User";
import HomeHeader from "../Header/HomeHeader";

export default async function HomeLayout({
    children,
    user,
}: {
    children: React.ReactNode;
    user?: User;
}) {
    return (
        <div className="layout layout--home">
            <HomeHeader user={user} />
            <main className="layout__main">{children}</main>
        </div>
    );
}
