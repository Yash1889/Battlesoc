"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GitHubForm } from "@/components/features/github-form";
import { CategoryBattle } from "@/components/features/category-battle";
import { getGitHubProfile, GitHubProfile } from "@/lib/github";
import { GITHUB_CATEGORIES } from "@/lib/github-categories";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GitHubPage() {
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState<GitHubProfile[]>([]);
    const [roast, setRoast] = useState<{ roast: string; advice: string } | null>(null);

    const handleBattle = async (usernames: string[]) => {
        setLoading(true);
        setProfiles([]);
        setRoast(null);

        try {
            const fetchedProfiles = await Promise.all(
                usernames.map(username => getGitHubProfile(username))
            );
            setProfiles(fetchedProfiles);

            // Fetch AI roast
            const res = await fetch("/api/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profiles: fetchedProfiles,
                    mode: "github_multi",
                    secret: localStorage.getItem("dracula_mode")
                }),
            });
            const data = await res.json();
            setRoast({ roast: data.roast, advice: data.advice });
        } catch (error) {
            console.error(error);
            alert("Failed to fetch profiles. Please check usernames.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate category wins for each profile
    const profilesWithWins = profiles.map(profile => {
        let wins = 0;
        GITHUB_CATEGORIES.forEach(category => {
            const values = profiles.map(p => category.getValue(p));
            const maxValue = Math.max(...values);
            if (category.getValue(profile) === maxValue) {
                wins++;
            }
        });
        return { ...profile, wins };
    });

    // Overall winner based on most category wins
    const sortedByWins = [...profilesWithWins].sort((a, b) => b.wins - a.wins);
    const overallWinner = sortedByWins[0];

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
                        GitHub Battle Arena
                    </h1>
                    <p className="text-muted-foreground">Compare GitHub profiles across 10 categories</p>
                </div>

                <AnimatePresence mode="wait">
                    {profiles.length === 0 ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <GitHubForm onSubmit={handleBattle} loading={loading} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-12"
                        >
                            {/* Overall Winner */}
                            <div className="text-center space-y-4">
                                <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                                <h2 className="text-4xl font-black">
                                    {overallWinner.name} <span className="text-yellow-500">Wins!</span>
                                </h2>
                                <p className="text-muted-foreground">
                                    Won {overallWinner.wins}/{GITHUB_CATEGORIES.length} categories
                                </p>
                            </div>

                            {/* Leaderboard */}
                            <Card className="p-8 glass-card">
                                <h3 className="text-2xl font-bold mb-6 text-center">Leaderboard</h3>
                                <div className="space-y-4">
                                    {sortedByWins.map((profile, i) => (
                                        <div
                                            key={profile.login}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl",
                                                i === 0 ? "bg-yellow-500/20 border-2 border-yellow-500" : "bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                {i === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={profile.name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-bold">{profile.name}</div>
                                                    <div className="text-sm text-muted-foreground">@{profile.login}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{profile.wins}</div>
                                                <div className="text-xs text-muted-foreground">Category Wins</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Category Breakdown */}
                            <CategoryBattle profiles={profiles} />

                            {/* AI Roast */}
                            {roast && (
                                <Card className="p-8 glass-card border-red-500/30 bg-black/40">
                                    <h3 className="text-2xl font-bold mb-4 text-red-400">AI Verdict</h3>
                                    <p className="text-lg text-white/90 mb-4 italic">"{roast.roast}"</p>
                                    <p className="text-muted-foreground">{roast.advice}</p>
                                </Card>
                            )}

                            <div className="flex justify-center">
                                <Button
                                    onClick={() => setProfiles([])}
                                    variant="outline"
                                    size="lg"
                                >
                                    New Battle
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
