"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslationsContext } from "@/context/translations-provider";
import { useMemo } from "react";

export default function Hero() {
    const { data: session } = useSession();
    const { t } = useTranslationsContext();

    const titleParts = useMemo(() => {
        const parts = t.home.hero.title.split("osu!guessr");
        return parts;
    }, [t.home.hero.title]);

    return (
        <section className="relative min-h-[80vh] flex items-center">
            <div className="absolute inset-0 bg-[url('/main_bg.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
            <div className="absolute bottom-0 p-2 flex flex-col sm:flex-row gap-2 text-muted-foreground">
                <Link href={"https://twitter.com/Akariimia"} target="_blank" className="hover:underline">
                    {t.home.hero.artCredit}
                </Link>
                <span className="hidden sm:inline">•</span>
                <div className="flex gap-2">
                    <Link href={"https://osu.ppy.sh/users/yorunoken"} target="_blank" className="hover:underline">
                        {t.home.hero.developerCredit}
                    </Link>
                    <span>•</span>
                    <Link href={"https://discord.gg/qrud2g4CA5"} target="_blank" className="hover:underline">
                        {t.home.hero.discordInvite}
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-5xl md:text-7xl font-bold mb-6">
                        {titleParts[0]}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">osu!guessr</span>
                        {titleParts[1]}
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="text-xl md:text-2xl text-foreground/80 mb-12 leading-relaxed">
                        {t.home.hero.subtitle}
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                        {session ? (
                            <Link href="#gamemodes">
                                <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
                                    {t.home.hero.startPlaying}
                                </Button>
                            </Link>
                        ) : (
                            <Button size="lg" onClick={() => signIn("osu")} className="text-lg px-8 w-full sm:w-auto">
                                {t.home.hero.signIn}
                            </Button>
                        )}
                        <Link href="/about">
                            <Button variant="outline" size="lg" className="text-lg px-8 w-full sm:w-auto">
                                {t.home.hero.learnMore}
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
