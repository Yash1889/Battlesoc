"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
    { href: "/", label: "Home" },
    { href: "/github", label: "GitHub" },
    { href: "/linkedin", label: "LinkedIn" },
    { href: "/resume", label: "Resume" },
    { href: "/typing", label: "Typing" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                        BattleSoc
                    </Link>

                    <div className="flex gap-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === route.href
                                        ? "text-white"
                                        : "text-muted-foreground"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
