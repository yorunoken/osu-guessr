"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/hooks/use-translations";

const gameModes = [
    {
        key: "background",
        image: "/ghostrule.jpg",
        url: "/games/background",
    },
    {
        key: "audio",
        image: "https://assets.ppy.sh/beatmaps/867737/covers/raw.jpg",
        url: "/games/audio",
    },
    {
        key: "skin",
        image: "/skin-mode.png",
        url: "/games/skin",
    },
];

export default function GameModeCards() {
    const { t } = useTranslations();

    return (
        <section className="py-24 bg-background" id="gamemodes">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16 text-foreground">{t.gameModes.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {gameModes.map((mode, index) => (
                        <Link href={mode.url} key={index} className="block group">
                            <div className="relative h-80 rounded-xl overflow-hidden bg-card border border-border/50 transition-all duration-300 transform group-hover:-translate-y-1">
                                <Image
                                    src={mode.image || "/placeholder.svg"}
                                    alt={t.gameModes.modes[mode.key].title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="group-hover:scale-105 transition-transform duration-500 opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                                <div className="absolute inset-0 flex flex-col justify-end p-8">
                                    <h3 className="text-2xl font-bold mb-3 text-primary">{t.gameModes.modes[mode.key].title}</h3>
                                    <p className="text-foreground/70 text-sm leading-relaxed">{t.gameModes.modes[mode.key].description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
