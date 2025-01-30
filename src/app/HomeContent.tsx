import { getHighestStatsAction, getTopPlayersAction } from "@/actions/user-server";
import Link from "next/link";
import Image from "next/image";
import { readChangelogs } from "@/actions/changelogs";
import { StatsCard } from "./components/StatsCard";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Users2 } from "lucide-react";

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

    const topPlayers = await getTopPlayersAction("background", 5);
    const highStats = await getHighestStatsAction();

    return (
        <>
            <section className="py-16 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatsCard title="Total Players" value={highStats.total_users.toLocaleString()} description="Players who signed up to play" icon={<Users2 className="h-6 w-6" />} />
                        <StatsCard title="Games Played" value={highStats.total_games.toLocaleString()} description="Total games completed" icon={<Gamepad2 className="h-6 w-6" />} />
                        <StatsCard title="High Score" value={highStats.highest_points.toLocaleString()} description="Current highest score in one game" icon={<Trophy className="h-6 w-6" />} />
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-xl p-6 border border-border/50">
                                <h2 className="text-2xl font-bold mb-6">Top Players</h2>
                                <div className="space-y-4">
                                    {topPlayers.map((player, index) => (
                                        <Link key={index} href={`/user/${player.bancho_id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">{index + 1}</span>
                                            <Image src={player.avatar_url} alt={player.username} width={40} height={40} className="rounded-full" />
                                            <div className="flex-1">
                                                <div className="font-medium">{player.username}</div>
                                                <div className="text-sm text-foreground/70">{Number(player.total_score).toLocaleString()} points</div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href="/leaderboard" className="block mt-6">
                                        <Button variant="outline" className="w-full">
                                            View Full Leaderboard
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-card rounded-xl p-6 border border-border/50">
                                <h2 className="text-2xl font-bold mb-6">Latest Updates</h2>
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
                                                                <a
                                                                    href={`https://github.com/yorunoken/osu-guessr/pull/${change.pr}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:underline"
                                                                >
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
                    </div>
                </div>
            </section>
        </>
    );
}
