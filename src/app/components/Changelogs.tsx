"use client";

import { useTranslationsContext } from "@/context/translations-provider";
import Link from "next/link";
import { SectionLabel } from "@/components/page-heading";
import type { Changelog } from "../HomeContent";

interface ChangelogsProps {
    changelogs: Array<Changelog>;
}

export function ChangelogsSection({ changelogs }: ChangelogsProps) {
    const { t } = useTranslationsContext();
    const sortedChangelogs = [...changelogs].reverse();

    return (
        <section className="page-container py-6">
            <div className="border-t border-border pt-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                    <SectionLabel>{t.home.updates.title}</SectionLabel>
                    <Link href="/announcements#changelog" className="subtle-link shrink-0 text-sm text-foreground/65 transition-colors hover:text-primary">
                        {t.common.viewMore}
                    </Link>
                </div>

                <div className="max-h-[420px] space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {sortedChangelogs.map((log, i) => (
                        <div key={i} className="border-b border-border/60 pb-5 last:border-0 last:pb-0">
                            <div className="mb-3 flex items-center gap-2">
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
                                                    href={`https://github.com/hanami-osu/osu-guessr/commit/${change.commit}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-block"
                                                >
                                                    [commit]
                                                </a>
                                            )}
                                            {change.pr && (
                                                <a
                                                    href={`https://github.com/hanami-osu/osu-guessr/pull/${change.pr}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-block"
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
        </section>
    );
}
