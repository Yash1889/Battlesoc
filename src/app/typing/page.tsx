"use client";

import { useTypingGame } from "@/hooks/use-typing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, Keyboard, Users, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

export default function TypingPage() {
    const [selectedDiff, setSelectedDiff] = useState<"easy" | "medium" | "hard">("easy");
    const [selectedCount, setSelectedCount] = useState<10 | 25 | 50>(25);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        text,
        currentInput,
        gameStatus,
        wpm,
        rawWpm,
        accuracy,
        startGame,
        handleInput,
        restart,
        getCharacterState
    } = useTypingGame();

    // Start game when settings change or on load
    useEffect(() => {
        // Check URL params
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const diffParam = params.get("diff") as "easy" | "medium" | "hard" | null;
            const countParam = params.get("count") ? parseInt(params.get("count")!) as 10 | 25 | 50 : null;
            const seedParam = params.get("seed");

            if (diffParam && ["easy", "medium", "hard"].includes(diffParam)) {
                setSelectedDiff(diffParam);
            }
            if (countParam && [10, 25, 50].includes(countParam)) {
                setSelectedCount(countParam);
            }

            // If we have params, use them. Otherwise use state.
            // Note: This might cause a double render if state updates, but it ensures sync.
            const diff = (diffParam && ["easy", "medium", "hard"].includes(diffParam)) ? diffParam : selectedDiff;
            const count = (countParam && [10, 25, 50].includes(countParam)) ? countParam : selectedCount;

            startGame(diff, count, seedParam || undefined);
        } else {
            startGame(selectedDiff, selectedCount);
        }

        // Focus input on start
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []); // Run once on mount to check params

    // Handle manual setting changes
    const handleSettingChange = (diff: "easy" | "medium" | "hard", count: 10 | 25 | 50) => {
        setSelectedDiff(diff);
        setSelectedCount(count);
        startGame(diff, count);
        // Clear URL params to avoid confusion
        window.history.replaceState({}, "", "/typing");
    };

    // Keep focus on input
    useEffect(() => {
        const handleKeyDown = () => inputRef.current?.focus();
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen py-20 px-4 flex flex-col items-center font-mono">
            <div className="w-full max-w-5xl space-y-12">

                {/* Header & Settings */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg shadow-orange-500/20">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">TypeRace</h1>
                            <p className="text-xs text-muted-foreground">v2.0 • Monkeytype Engine</p>
                        </div>
                    </div>

                    {/* Settings Bar */}
                    <Card className="p-1.5 glass-card flex items-center gap-4 rounded-xl bg-black/40 border-white/5">
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {(["easy", "medium", "hard"] as const).map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => handleSettingChange(diff, selectedCount)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                                        selectedDiff === diff
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-muted-foreground hover:text-white/80"
                                    )}
                                >
                                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {([10, 25, 50] as const).map((count) => (
                                <button
                                    key={count}
                                    onClick={() => handleSettingChange(selectedDiff, count)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                                        selectedCount === count
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-muted-foreground hover:text-white/80"
                                    )}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Multiplayer Button */}
                    <Button
                        variant="outline"
                        className="gap-2 border-white/10 hover:bg-white/5"
                        onClick={() => {
                            const seed = Math.random().toString(36).substring(7);
                            const url = new URL(window.location.href);
                            url.searchParams.set("diff", selectedDiff);
                            url.searchParams.set("count", selectedCount.toString());
                            url.searchParams.set("seed", seed);

                            navigator.clipboard.writeText(url.toString());

                            // Restart game with this seed so host plays same game
                            startGame(selectedDiff, selectedCount, seed);

                            // Visual feedback
                            const btn = document.getElementById("race-btn");
                            if (btn) {
                                const originalText = btn.innerHTML;
                                btn.innerHTML = '<span class="flex items-center gap-2 text-green-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Link Copied!</span>';
                                setTimeout(() => btn.innerHTML = originalText, 2000);
                            }
                        }}
                        id="race-btn"
                    >
                        <Users className="w-4 h-4" />
                        Race Friends
                    </Button>
                </div>

                {/* Main Game Area */}
                <AnimatePresence mode="wait">
                    {gameStatus === "finished" ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="space-y-8 text-center md:text-left">
                                <div>
                                    <div className="text-sm text-muted-foreground uppercase tracking-widest mb-2">WPM</div>
                                    <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 leading-none">
                                        {wpm}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Accuracy</div>
                                        <div className="text-4xl font-bold text-white">{accuracy}%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Raw</div>
                                        <div className="text-4xl font-bold text-white/60">{rawWpm}</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center md:justify-start pt-4">
                                    <Button onClick={() => startGame(selectedDiff, selectedCount)} size="lg" className="bg-white text-black hover:bg-white/90 w-full md:w-auto">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Restart Test
                                    </Button>
                                </div>
                            </div>

                            <Card className="p-8 glass-card flex items-center justify-center bg-black/40 border-white/10">
                                <div className="text-center space-y-6">
                                    <Trophy className="w-32 h-32 text-yellow-500 mx-auto drop-shadow-[0_0_50px_rgba(234,179,8,0.4)] animate-pulse-glow" />
                                    <div>
                                        <h3 className="text-3xl font-bold mb-2">
                                            {wpm > 100 ? "Godlike! ⚡" : wpm > 80 ? "Master! 🏆" : wpm > 60 ? "Pro! 🔥" : "Good Job! 👍"}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            You typed {selectedCount} words with {accuracy}% accuracy.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative"
                        >
                            {/* Live Stats - Minimal */}
                            {gameStatus === "playing" && (
                                <div className="absolute -top-12 left-0 flex gap-8 text-xl font-bold text-white/30 transition-all">
                                    <span className={cn(wpm > 0 && "text-yellow-500")}>{wpm} WPM</span>
                                    <span>{accuracy}%</span>
                                </div>
                            )}

                            <Card
                                className={cn(
                                    "p-12 glass-card min-h-[300px] flex flex-col justify-center transition-all duration-300 relative overflow-hidden",
                                    gameStatus === "playing" ? "border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.05)]" : "border-white/5"
                                )}
                                onClick={() => inputRef.current?.focus()}
                            >
                                {/* Text Display */}
                                <div className="relative text-3xl leading-relaxed font-mono tracking-wide select-none outline-none z-10">
                                    <div className="flex flex-wrap gap-x-3 gap-y-4">
                                        {text.split(" ").map((word, wordIndex) => {
                                            let globalIndex = 0;
                                            for (let i = 0; i < wordIndex; i++) globalIndex += text.split(" ")[i].length + 1;

                                            return (
                                                <div key={wordIndex} className="relative">
                                                    {word.split("").map((char, charIndex) => {
                                                        const currentIdx = globalIndex + charIndex;
                                                        const status = getCharacterState(currentIdx, char);
                                                        const isCurrent = currentInput.length === currentIdx;

                                                        return (
                                                            <span key={charIndex} className="relative">
                                                                {/* CSS Cursor - No Framer Motion for performance */}
                                                                {isCurrent && (
                                                                    <span className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-yellow-500 animate-pulse" />
                                                                )}
                                                                <span
                                                                    className={cn(
                                                                        "transition-colors duration-75",
                                                                        status === "correct" ? "text-white" :
                                                                            status === "incorrect" ? "text-red-500 underline decoration-red-500/50" :
                                                                                "text-white/20"
                                                                    )}
                                                                >
                                                                    {char}
                                                                </span>
                                                            </span>
                                                        );
                                                    })}
                                                    {/* Space handling */}
                                                    {wordIndex < text.split(" ").length - 1 && (
                                                        <span className="relative">
                                                            {currentInput.length === globalIndex + word.length && (
                                                                <span className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-yellow-500 animate-pulse" />
                                                            )}
                                                            <span className={cn(
                                                                "transition-colors duration-75",
                                                                getCharacterState(globalIndex + word.length, " ") === "incorrect" ? "bg-red-500/20" : ""
                                                            )}>&nbsp;</span>
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={currentInput}
                                    onChange={(e) => handleInput(e.target.value)}
                                    className="absolute opacity-0 w-full h-full cursor-default z-20"
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                />

                                {/* Start Overlay */}
                                {gameStatus === "idle" && currentInput.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-30 pointer-events-none transition-opacity duration-300">
                                        <div className="flex items-center gap-3 text-white/50 bg-black/50 px-6 py-3 rounded-full border border-white/10">
                                            <Keyboard className="w-5 h-5 animate-pulse" />
                                            <span>Type to start...</span>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <div className="flex justify-center mt-12">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startGame(selectedDiff, selectedCount)}
                                    className="text-muted-foreground hover:text-white hover:bg-white/5 hover:rotate-180 transition-all duration-500"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
