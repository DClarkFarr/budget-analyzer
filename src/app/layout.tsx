import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/Providers/QueryProvider";
import { ModalProvider } from "@/components/Providers/ModalProvider";
import { AccountProvider } from "@/components/Providers/AccountProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Budget Analyzer - Generic",
    description: "You probably shouldn't be seeing this.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <QueryProvider>
                    <ModalProvider>
                        <AccountProvider>{children}</AccountProvider>
                    </ModalProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
