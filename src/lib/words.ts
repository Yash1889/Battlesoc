const COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "time", "year", "work", "when", "can", "said", "each", "which", "new", "has"
];

const COMPLEX_WORDS = [
    "algorithm", "development", "javascript", "function", "component", "database",
    "interface", "framework", "implementation", "optimization", "architecture",
    "synchronous", "asynchronous", "authentication", "encryption", "performance"
];

const CODE_SNIPPETS = [
    "const x = 42;",
    "function hello() { return 'world'; }",
    "if (condition) { doSomething(); }",
    "for (let i = 0; i < 10; i++) { }",
    "const arr = [1, 2, 3].map(x => x * 2);",
    "fetch('/api/data').then(res => res.json());",
    "export default MyComponent;",
    "import React from 'react';",
];

// Simple seeded random number generator (Linear Congruential Generator)
function seededRandom(seed: number) {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return function () {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}

export function generateWords(difficulty: "easy" | "medium" | "hard", length: number, seed?: string): string {
    let words: string[] = [];

    // Convert string seed to number or use random
    const numericSeed = seed ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 100000);
    const random = seededRandom(numericSeed);

    if (difficulty === "easy") {
        for (let i = 0; i < length; i++) {
            words.push(COMMON_WORDS[Math.floor(random() * COMMON_WORDS.length)]);
        }
    } else if (difficulty === "medium") {
        for (let i = 0; i < length; i++) {
            const word = COMPLEX_WORDS[Math.floor(random() * COMPLEX_WORDS.length)];
            // Add punctuation sometimes
            if (random() > 0.7) {
                const punct = [',', '.', '!', '?'][Math.floor(random() * 4)];
                words.push(word + punct);
            } else {
                words.push(word);
            }
        }
    } else {
        for (let i = 0; i < length; i++) {
            words.push(CODE_SNIPPETS[Math.floor(random() * CODE_SNIPPETS.length)]);
        }
    }

    return words.join(" ");
}
