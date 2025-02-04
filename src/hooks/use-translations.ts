"use client";

import { useState, useEffect } from "react";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

export const languages = {
    en: "English",
    tr: "Türkçe",
} as const;

const messages = { en, tr } as const;
export type Locale = keyof typeof messages;

export function useTranslations() {
    const [locale, setLocale] = useState<Locale>("en");

    useEffect(() => {
        const stored = localStorage.getItem("locale") as Locale;
        if (stored && stored in messages) {
            setLocale(stored);
        }
    }, []);

    const setLanguage = (newLocale: Locale) => {
        localStorage.setItem("locale", newLocale);
        setLocale(newLocale);
        window.location.reload();
    };

    return {
        t: messages[locale],
        locale,
        setLanguage,
    };
}
