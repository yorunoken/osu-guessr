"use client";

import { createContext, useContext } from "react";
import { useTranslations } from "@/hooks/use-translations";

const TranslationsContext = createContext<ReturnType<typeof useTranslations> | null>(null);

export function TranslationsProvider({ children }: { children: React.ReactNode }) {
    const translations = useTranslations();

    return <TranslationsContext.Provider value={translations}>{children}</TranslationsContext.Provider>;
}

export function useTranslationsContext() {
    const context = useContext(TranslationsContext);
    if (!context) {
        throw new Error("useTranslationsContext must be used within a TranslationsProvider");
    }
    return context;
}
