"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import React from "react";

const StyledGameName = () => <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">osu!guessr</span>;

export default function UserNotFound() {
    const { t } = useTranslations();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-4xl font-bold mb-4">{t.user.notFound.title}</h1>

                    <div className="space-y-4 mb-8">
                        <p className="text-foreground/70">{t.user.notFound.description}</p>
                        <p className="text-foreground/70">
                            {t.user.notFound.subDescription.split("{osu_guessr}").map((part: string, index: number, array: string[]) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < array.length - 1 && <StyledGameName />}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button className="w-full sm:w-auto">{t.user.notFound.actions.home}</Button>
                        </Link>
                        <Link href="/leaderboard">
                            <Button variant="outline" className="w-full sm:w-auto">
                                {t.user.notFound.actions.leaderboard}
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-sm text-foreground/50">{t.errors.game.unknown}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
