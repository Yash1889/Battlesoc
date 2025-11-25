import { Navbar } from "@/components/ui/navbar";
import { DraculaProvider } from "@/hooks/use-dracula";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "BattleSoc - AI Battle Platform",
    description: "Compare GitHub profiles, LinkedIn profiles, resumes, and typing speeds with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">
                <DraculaProvider>
                    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                        <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20" />
                        <Navbar />
                        <main className="relative pt-16">
                            {children}
                        </main>
                    </div>
                </DraculaProvider>
            </body>
        </html>
    );
}
