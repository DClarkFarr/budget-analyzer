import Link from "next/link";

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="layout layout--login w-full min-h-screen flex flex-col justify-center items-center">
            <div className="layout__content mb-8">{children}</div>
            <div className="layout__footer">
                <Link
                    href="/"
                    className="text-sky-600 hover:text-sky-700 underline"
                >
                    Back to home
                </Link>
            </div>
        </div>
    );
}
