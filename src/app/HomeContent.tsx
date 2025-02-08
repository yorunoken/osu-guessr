"use client";

import { StatsCard } from "./components/StatsCard";
import { Gamepad2, Trophy, Users2 } from "lucide-react";
import { useTranslationsContext } from "@/context/translations-provider";
import React from "react";
import { SupportersSection } from "./components/Supporters";
import { ChangelogsSection } from "./components/Changelogs";

export interface ChangelogEntry {
    description: string;
    commit?: string;
    pr?: string;
}

export interface Changelog {
    version: string;
    date: string;
    changes: Array<ChangelogEntry>;
}

interface HomeContentProps {
    changelogs: Array<Changelog>;
    highStats: {
        total_users: number;
        total_games: number;
        highest_points: number;
    };
}

export default function HomeContent({ changelogs, highStats }: HomeContentProps) {
    const { t } = useTranslationsContext();

    return (
        <>
            <section className="py-16 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6 text-center">{t.home.statistics.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatsCard
                            title={t.home.statistics.totalPlayers.title}
                            value={highStats.total_users.toLocaleString()}
                            description={t.home.statistics.totalPlayers.description}
                            icon={<Users2 className="h-6 w-6" />}
                        />
                        <StatsCard
                            title={t.home.statistics.gamesPlayed.title}
                            value={highStats.total_games.toLocaleString()}
                            description={t.home.statistics.gamesPlayed.description}
                            icon={<Gamepad2 className="h-6 w-6" />}
                        />
                        <StatsCard
                            title={t.home.statistics.highScore.title}
                            value={highStats.highest_points.toLocaleString()}
                            description={t.home.statistics.highScore.description}
                            icon={<Trophy className="h-6 w-6" />}
                        />
                    </div>
                </div>
            </section>

            <section className="py-16">
                <SupportersSection />
            </section>

            <section className="py-16 bg-secondary/20">
                <ChangelogsSection changelogs={changelogs} />
            </section>
        </>
    );
}
