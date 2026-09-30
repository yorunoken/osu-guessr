"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslationsContext } from "@/context/translations-provider";
import React from "react";

export default function UserNotFound() {
    const { t } = useTranslationsContext();

    return (
        <div className="page-container py-10 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="border-t border-border/60 pt-8">
                    <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl mb-4">{t.user.notFound.title}</h1>

                    <div className="space-y-4 mb-8">
                        <p className="text-foreground/70">
                            {t.user.notFound.subDescription.split("{osu_guessr}").map((part: string, index: number, array: string[]) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < array.length - 1 && <span className="text-primary">osu!guessr</span>}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/">{t.user.notFound.actions.home}</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <Link href="/leaderboard">{t.user.notFound.actions.leaderboard}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
