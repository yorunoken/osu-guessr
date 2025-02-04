"use client";

import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslations, languages, Locale } from "@/hooks/use-translations";

export function LanguageSwitcher() {
    const { locale, setLanguage } = useTranslations();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-2" align="end">
                {Object.entries(languages).map(([code, name]) => (
                    <DropdownMenuItem key={code} onClick={() => setLanguage(code as Locale)} className={locale === code ? "bg-accent" : "" + " hover:cursor-pointer"}>
                        {name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
