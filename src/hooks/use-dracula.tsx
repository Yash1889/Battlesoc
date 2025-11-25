"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DraculaContextType {
    isDraculaMode: boolean;
    toggleDraculaMode: () => void;
}

const DraculaContext = createContext<DraculaContextType | undefined>(undefined);

export function DraculaProvider({ children }: { children: ReactNode }) {
    const [isDraculaMode, setIsDraculaMode] = useState(false);

    const toggleDraculaMode = () => {
        const newMode = !isDraculaMode;
        setIsDraculaMode(newMode);

        if (newMode) {
            localStorage.setItem("dracula_mode", "true");
        } else {
            localStorage.removeItem("dracula_mode");
        }
    };

    return (
        <DraculaContext.Provider value={{ isDraculaMode, toggleDraculaMode }}>
            {children}
        </DraculaContext.Provider>
    );
}

export function useDracula() {
    const context = useContext(DraculaContext);
    if (!context) {
        throw new Error("useDracula must be used within DraculaProvider");
    }
    return context;
}
