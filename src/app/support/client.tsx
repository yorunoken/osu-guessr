"use client";

import { useTranslationsContext } from "@/context/translations-provider";
import { Button } from "@/components/ui/button";
import { Coffee, AlertCircle } from "lucide-react";

export function SupportPageContent() {
    const { t } = useTranslationsContext();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">{t.support.title}</h1>
                    <p className="text-lg text-muted-foreground">{t.support.description}</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">{t.support.benefits.title}</h2>
                    <ul className="space-y-3">
                        {Object.values(t.support.benefits.items).map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-foreground">
                                <span>•</span>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">{t.support.donate.title}</h2>
                    <div className="rounded-lg border p-4 flex items-start gap-3 bg-yellow-500/10 border-yellow-500/50">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">Please include your osu!guessr username or user ID in your donation message to receive supporter benefits!</p>
                    </div>
                    <a
                        href="https://www.buymeacoffee.com/yorunoken"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-6 rounded-lg border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Coffee className="h-6 w-6 text-primary" />
                            <span className="text-xl font-medium">{t.support.donate.button}</span>
                        </div>
                        <p className="text-muted-foreground mb-6">{t.support.donate.description}</p>
                        <Button className="w-full bg-primary hover:bg-primary/90">{t.support.donate.button}</Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
