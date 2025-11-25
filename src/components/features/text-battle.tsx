"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, AlertCircle } from "lucide-react";

interface TextBattleProps {
    title: string;
    description: string;
    placeholder1: string;
    placeholder2: string;
    mode: "linkedin" | "resume";
}

export function TextBattle({ title, description, placeholder1, placeholder2, mode }: TextBattleProps) {
    const [name1, setName1] = useState("");
    const [name2, setName2] = useState("");
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        winner: string;
        roast: string;
        advice: string;
        analysis?: {
            title: string;
            p1_score: number;
            p2_score: number;
            winner: string;
            reason: string;
        }[];
    } | null>(null);

    const handleBattle = async () => {
        if (!text1 || !text2) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    p1: text1,
                    p2: text2,
                    name1: name1 || "Player 1",
                    name2: name2 || "Player 2",
                    mode,
                    secret: localStorage.getItem("dracula_mode")
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 flex flex-col items-center gap-8 px-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-600">
                    {title}
                </h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <Card className="p-6 glass-card space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted-foreground">Player 1 Name</label>
                                <input
                                    type="text"
                                    value={name1}
                                    onChange={(e) => setName1(e.target.value)}
                                    placeholder="e.g. Elon Musk"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted-foreground">Profile Text</label>
                                <textarea
                                    value={text1}
                                    onChange={(e) => setText1(e.target.value)}
                                    placeholder={placeholder1}
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                />
                            </div>
                        </Card>

                        <Card className="p-6 glass-card space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted-foreground">Player 2 Name</label>
                                <input
                                    type="text"
                                    value={name2}
                                    onChange={(e) => setName2(e.target.value)}
                                    placeholder="e.g. Jensen Huang"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-pink-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted-foreground">Profile Text</label>
                                <textarea
                                    value={text2}
                                    onChange={(e) => setText2(e.target.value)}
                                    placeholder={placeholder2}
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
                                />
                            </div>
                        </Card>

                        <div className="md:col-span-2 flex justify-center">
                            <Button
                                onClick={handleBattle}
                                disabled={loading || !text1 || !text2}
                                size="lg"
                                className="w-full max-w-md bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500"
                            >
                                {loading ? "Analyzing..." : "Start Battle"}
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="inline-block"
                            >
                                <Trophy className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                            </motion.div>
                            <h2 className="text-5xl font-black text-white tracking-tight">
                                {result.winner} <span className="text-yellow-500">Wins!</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">The superior professional profile.</p>
                        </div>

                        {result.analysis && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-center mb-8">Detailed Breakdown</h3>
                                <div className="grid gap-6">
                                    {result.analysis.map((point, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-lg">{point.title}</span>
                                                <span className="text-xs text-muted-foreground uppercase tracking-widest">{point.reason}</span>
                                            </div>

                                            <div className="relative h-8 bg-black/40 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-blue-500 flex items-center justify-start px-3 text-xs font-bold text-white transition-all duration-1000"
                                                    style={{ width: `${(Number(point.p1_score) / (Number(point.p1_score) + Number(point.p2_score))) * 100}%` }}
                                                >
                                                    {name1 || "P1"}: {point.p1_score}
                                                </div>

                                                <div
                                                    className="h-full bg-pink-500 flex items-center justify-end px-3 text-xs font-bold text-white transition-all duration-1000"
                                                    style={{ width: `${(Number(point.p2_score) / (Number(point.p1_score) + Number(point.p2_score))) * 100}%` }}
                                                >
                                                    {name2 || "P2"}: {point.p2_score}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-8 glass-card border-red-500/30 bg-black/40 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                                <div className="flex items-center gap-3 mb-4">
                                    <Flame className="w-6 h-6 text-red-500" />
                                    <h3 className="text-xl font-bold text-red-400">The Roast</h3>
                                </div>
                                <p className="text-lg text-white/90 italic leading-relaxed">"{result.roast}"</p>
                            </Card>

                            <Card className="p-8 glass-card border-blue-500/30 bg-black/40 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-6 h-6 text-blue-500" />
                                    <h3 className="text-xl font-bold text-blue-400">Expert Advice</h3>
                                </div>
                                <p className="text-lg text-white/90 leading-relaxed">{result.advice}</p>
                            </Card>
                        </div>

                        <div className="flex justify-center pt-8">
                            <Button onClick={() => setResult(null)} variant="outline" size="lg">
                                New Battle
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
