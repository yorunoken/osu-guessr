import { getHighestStatsAction } from "@/actions/user-server";
import { readChangelogs } from "@/actions/changelogs";
import { StatsCard } from "./components/StatsCard";
import { Gamepad2, Trophy, Users2 } from "lucide-react";

import { supporters } from "@/config/supporters";
import { SupportDialogWrapper } from "@/components/SupportDialogWrapper";

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

export default async function HomeContent() {
    const changelogs: Array<Changelog> = await readChangelogs();
    changelogs.reverse();

    const highStats = await getHighestStatsAction();

    return (
        <>
            <section className="py-16 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6 text-center">Game Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatsCard title="Total Players" value={highStats.total_users.toLocaleString()} description="Players who signed up to play" icon={<Users2 className="h-6 w-6" />} />
                        <StatsCard title="Games Played" value={highStats.total_games.toLocaleString()} description="Total games completed" icon={<Gamepad2 className="h-6 w-6" />} />
                        <StatsCard title="High Score" value={highStats.highest_points.toLocaleString()} description="Current highest score in one game" icon={<Trophy className="h-6 w-6" />} />
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Supporters</h2>

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
                            <p>Be the first to support osu!guessr!</p>
                            <SupportDialogWrapper />
                        </div>
                    )}
                </div>
            </section>

            <section className="py-16 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="bg-card rounded-xl p-6 border border-border/50">
                        <h2 className="text-2xl font-bold mb-6 text-center">Latest Updates</h2>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto">
                            {changelogs.map((log, i) => (
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
