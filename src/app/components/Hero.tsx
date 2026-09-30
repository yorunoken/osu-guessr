"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslationsContext } from "@/context/translations-provider";
import { Users } from "lucide-react";

export default function Hero() {
    const { data: session } = useSession();
    const { t } = useTranslationsContext();

    const titleParts = t.home.hero.title.split("osu!guessr");

    const scrollToGamemodes = () => {
        const gamemodesElement = document.getElementById("gamemodes");
        gamemodesElement?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    };

    return (
        <section className="relative isolate overflow-hidden">
            <div className="absolute inset-0 bg-[url('/main_bg.webp')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30"></div>

            <div className="page-container relative z-10 py-14 sm:py-20 lg:py-24">
                <div className="max-w-3xl">
                    <h1 className="font-display text-3xl font-semibold tracking-tight mb-4 leading-tight sm:text-4xl lg:text-5xl">
                        {titleParts[0]}
                        <span className="text-primary">osu!guessr</span>
                        {titleParts[1]}
                    </h1>

                    <p className="max-w-xl text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">{t.home.hero.subtitle}</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {session ? (
                            <Button size="lg" onClick={scrollToGamemodes} className="text-sm px-6 w-full sm:w-auto">
                                {t.home.hero.startPlaying}
                            </Button>
                        ) : (
                            <Button size="lg" onClick={() => signIn("hanami")} className="text-sm px-6 w-full sm:w-auto">
                                {t.home.hero.signIn}
                            </Button>
                        )}
                        <Button asChild variant="secondary" size="lg" className="text-sm px-6 w-full sm:w-auto bg-background/60">
                            <Link href="/multiplayer">
                                <Users className="size-4" />
                                {t.home.hero.multiplayer}
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg" className="text-sm px-6 w-full sm:w-auto">
                            <Link href="/about">{t.home.hero.learnMore}</Link>
                        </Button>
                    </div>
                    {!session && <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{t.errors.auth.required.description}</p>}
                </div>
            </div>

            <div className="relative z-10 w-full py-3">
                <div className="page-container flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm">
                    <Link href={"https://twitter.com/Akariimia"} target="_blank" className="subtle-link text-foreground/65 hover:text-primary transition-colors">
                        {t.home.hero.artCredit}
                    </Link>
                </div>
            </div>
        </section>
    );
}
