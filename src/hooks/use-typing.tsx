"use client";

import { useState, useCallback, useEffect } from "react";
import { generateWords } from "@/lib/words";

export interface CharacterState {
    char: string;
    status: "correct" | "incorrect" | "extra" | "pending";
}

export function useTypingGame() {
    const [text, setText] = useState("");
    const [currentInput, setCurrentInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "finished">("idle");
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
    const [wordCount, setWordCount] = useState(25);

    // Stats
    const [wpm, setWpm] = useState(0);
    const [rawWpm, setRawWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    const startGame = useCallback((diff: "easy" | "medium" | "hard", count: number, seed?: string) => {
        const newText = generateWords(diff, count, seed);
        setText(newText);
        setCurrentInput("");
        setStartTime(null);
        setGameStatus("idle"); // Start as idle, wait for first input
        setDifficulty(diff);
        setWordCount(count);
        setWpm(0);
        setRawWpm(0);
        setAccuracy(100);
    }, []);

    const restart = useCallback(() => {
        startGame(difficulty, wordCount);
    }, [difficulty, wordCount, startGame]);

    const handleInput = useCallback((value: string) => {
        if (gameStatus === "finished") return;

        // Start timer on first input
        if (gameStatus === "idle" && value.length > 0) {
            setGameStatus("playing");
            setStartTime(Date.now());
        }

        setCurrentInput(value);

        // Calculate stats in real-time
        if (startTime) {
            const elapsedMin = (Date.now() - startTime) / 1000 / 60;
            const wordsTyped = value.length / 5;
            const raw = Math.round(wordsTyped / Math.max(elapsedMin, 0.001));

            // Calculate correct chars for net WPM
            let correctChars = 0;
            for (let i = 0; i < value.length; i++) {
                if (i < text.length && value[i] === text[i]) {
                    correctChars++;
                }
            }
            const net = Math.round((correctChars / 5) / Math.max(elapsedMin, 0.001));
            const acc = value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;

            setRawWpm(raw);
            setWpm(Math.max(0, net)); // Prevent negative WPM
            setAccuracy(acc);
        }

        // Check for completion (lenient: just length check)
        if (value.length >= text.length) {
            setGameStatus("finished");
        }
    }, [gameStatus, text, startTime]);

    // Derived state for UI rendering
    // We compute this on the fly during render in the component or here if needed
    // But returning it as a helper function or memoized value is better than state
    const getCharacterState = (index: number, char: string): CharacterState["status"] => {
        if (index >= currentInput.length) return "pending";
        if (index >= text.length) return "extra"; // Should not happen if we limit input length
        if (currentInput[index] === char) return "correct";
        return "incorrect";
    };

    return {
        text,
        currentInput,
        gameStatus,
        wpm,
        rawWpm,
        accuracy,
        startGame,
        handleInput,
        restart,
        difficulty,
        wordCount,
        getCharacterState
    };
}
