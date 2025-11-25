"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GitHubFormProps {
    onSubmit: (usernames: string[]) => void;
    loading: boolean;
}

export function GitHubForm({ onSubmit, loading }: GitHubFormProps) {
    const [count, setCount] = useState(2);
    const [usernames, setUsernames] = useState<string[]>(["", ""]);

    const handleCountChange = (newCount: number) => {
        setCount(newCount);
        const newUsernames = Array(newCount).fill("").map((_, i) => usernames[i] || "");
        setUsernames(newUsernames);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validUsernames = usernames.filter(u => u.trim());
        if (validUsernames.length >= 2) {
            onSubmit(validUsernames);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex gap-4 items-center justify-center">
                <label className="text-sm text-muted-foreground">Players:</label>
                {[2, 3, 4, 5, 6, 7].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => handleCountChange(n)}
                        className={`px-3 py-1 rounded-lg transition-colors ${count === n
                                ? "bg-primary text-white"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                    >
                        {n}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usernames.map((username, i) => (
                    <Input
                        key={i}
                        value={username}
                        onChange={(e) => {
                            const newUsernames = [...usernames];
                            newUsernames[i] = e.target.value;
                            setUsernames(newUsernames);
                        }}
                        placeholder={`GitHub Username ${i + 1}`}
                        disabled={loading}
                    />
                ))}
            </div>

            <Button
                type="submit"
                disabled={loading || usernames.filter(u => u.trim()).length < 2}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
                {loading ? "Loading..." : "Start Battle"}
            </Button>
        </form>
    );
}
