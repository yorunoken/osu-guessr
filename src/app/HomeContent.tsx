"use client";

import { StatsCard } from "./components/StatsCard";
import { Gamepad2, Trophy, Users2 } from "lucide-react";
import { supporters } from "@/config/supporters";
import { useTranslationsContext } from "@/context/translations-provider";
import React from "react";
import { SupportPageLink } from "@/components/SupportDialogWrapper";

interface ChangelogEntry {
    description: string;
    commit?: string;
    pr?: string;
}

interface Changelog {
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

const StyledGameName = () => <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">osu!guessr</span>;

export default function HomeContent({ changelogs, highStats }: HomeContentProps) {
    const { t } = useTranslationsContext();
    const sortedChangelogs = [...changelogs].reverse();

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
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <h2 className="text-3xl font-bold text-center">{t.home.supporters.title}</h2>
                        <SupportPageLink />
                    </div>

                    {supporters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {supporters.map((supporter, index) => (
                                <div key={index} className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="font-semibold">
                                            {supporter.url ? (
                                                <a href={supporter.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                                    {supporter.name}
                                                </a>
                                            ) : (
                                                supporter.name
                                            )}
                                        </div>
                                        <div className="text-sm text-primary">${supporter.amount}</div>
                                    </div>
                                    {supporter.message && (
                                        <p className="text-sm text-foreground/70 italic">
                                            {'"'}
                                            {supporter.message}
                                            {'"'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-foreground/70">
                            <p>
                                {t.home.supporters.beFirst.split("{osu_guessr}").map((part: string, index: number, array: string[]) => (
                                    <React.Fragment key={index}>
                                        {part}
                                        {index < array.length - 1 && <StyledGameName />}
                                    </React.Fragment>
                                ))}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-16 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="bg-card rounded-xl p-6 border border-border/50">
                        <h2 className="text-2xl font-bold mb-6 text-center">{t.home.updates.title}</h2>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto">
                            {sortedChangelogs.map((log, i) => (
                                <div key={i} className="border-b border-border/50 last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg font-semibold">{log.version}</span>
                                        <span className="text-sm text-foreground/70">• {log.date}</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {log.changes.map((change, j) => (
                                            <li key={j} className="text-foreground/80 flex items-start gap-2">
                                                <span className="text-primary">•</span>
                                                <span>{change.description}</span>
                                                <div className="space-x-2 text-sm">
                                                    {change.commit && (
                                                        <a
                                                            href={`https://github.com/yorunoken/osu-guessr/commit/${change.commit}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            [commit]
                                                        </a>
                                                    )}
                                                    {change.pr && (
                                                        <a href={`https://github.com/yorunoken/osu-guessr/pull/${change.pr}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                            [PR #{change.pr}]
                                                        </a>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
