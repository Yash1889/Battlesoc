"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { GitHubProfile } from "@/lib/github";
import { GITHUB_CATEGORIES } from "@/lib/github-categories";
import { Trophy } from "lucide-react";

interface CategoryBattleProps {
    profiles: GitHubProfile[];
}

export function CategoryBattle({ profiles }: CategoryBattleProps) {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">Category Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GITHUB_CATEGORIES.map((category, i) => {
                    const values = profiles.map(p => ({
                        name: p.name || p.login,
                        value: category.getValue(p)
                    }));

                    const maxValue = Math.max(...values.map(v => v.value));
                    const winners = values.filter(v => v.value === maxValue);

                    // Sort by value descending
                    const sorted = [...values].sort((a, b) => b.value - a.value);

                    return (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-6 glass-card">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">{category.icon}</span>
                                    <h3 className="text-xl font-bold">{category.name}</h3>
                                </div>

                                <div className="space-y-3">
                                    {sorted.map((item, idx) => {
                                        const isWinner = item.value === maxValue;
                                        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                                        return (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className={`flex items-center gap-2 ${isWinner ? 'text-yellow-400 font-bold' : 'text-muted-foreground'}`}>
                                                        {isWinner && <Trophy className="w-4 h-4" />}
                                                        {item.name}
                                                    </span>
                                                    <span className={isWinner ? 'text-white font-bold' : 'text-muted-foreground'}>
                                                        {item.value.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 0.5, delay: i * 0.1 + idx * 0.05 }}
                                                        className={`h-full ${isWinner
                                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                                                : 'bg-gradient-to-r from-blue-500/50 to-purple-500/50'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
