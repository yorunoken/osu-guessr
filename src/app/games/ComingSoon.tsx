"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslationsContext } from "@/context/translations-provider";

interface ComingSoonProps {
    mode: "Audio" | "Skin";
}

export default function ComingSoon({ mode }: ComingSoonProps) {
    const { t } = useTranslationsContext();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-3xl font-bold mb-6">{t.components.comingSoon.title.replace("{mode}", mode)}</h1>

                    <div className="space-y-6 mb-8">
                        <div className="py-8">
                            <h2 className="text-2xl font-semibold mb-4">{t.components.comingSoon.message}</h2>
                            <p className="text-foreground/70">{t.components.comingSoon.description.replace("{mode}", mode.toLowerCase())}</p>
                        </div>

                        <div className="bg-secondary/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-3">{t.components.comingSoon.whatToExpect.title}</h3>
                            {mode === "Audio" ? (
                                <p className="text-foreground/70">{t.components.comingSoon.whatToExpect.audio}</p>
                            ) : (
                                <p className="text-foreground/70">{t.components.comingSoon.whatToExpect.skin}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/">
                            <Button>{t.components.comingSoon.actions.home}</Button>
                        </Link>
                        <Link href="/games/background">
                            <Button variant="outline">{t.components.comingSoon.actions.tryBackground}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
