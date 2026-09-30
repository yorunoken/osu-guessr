import { listAnnouncements } from "@/actions/announcements";
import { readChangelogs } from "@/actions/changelogs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Announcements & changelog",
    description: "Announcements and release history for osu!guessr.",
};

function announcementSlug(title: string, id: number) {
    const slug = title
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${slug || "announcement"}-${id}`;
}

function releaseSlug(version: string) {
    return `release-${version.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export default async function AnnouncementsPage() {
    const [announcements, changelogs] = await Promise.all([listAnnouncements(), readChangelogs()]);
    const releases = [...changelogs].reverse();

    return (
        <div className="page-container pb-12 pt-3 md:pb-16 md:pt-4">
            <header className="py-5 sm:py-6">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Announcements &amp; changelog</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">Service news, feature announcements, and the full osu!guessr release history.</p>
                <nav className="mt-5 flex flex-wrap gap-3 text-sm" aria-label="Updates sections">
                    <a className="rounded-full bg-card/70 px-3 py-1.5 text-foreground/80 hover:text-primary" href="#announcements">
                        Announcements <span className="text-muted-foreground">({announcements.length})</span>
                    </a>
                    <a className="rounded-full bg-card/70 px-3 py-1.5 text-foreground/80 hover:text-primary" href="#changelog">
                        Changelog <span className="text-muted-foreground">({releases.length})</span>
                    </a>
                </nav>
            </header>

            <section id="announcements" className="scroll-mt-24 pt-4" aria-labelledby="announcements-title">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="announcements-title" className="font-display text-xl font-semibold tracking-tight text-foreground">
                        Announcements
                    </h2>
                    <p className="text-xs text-muted-foreground">News and service updates</p>
                </div>
                {announcements.length === 0 ? (
                    <div className="rounded-lg bg-card/60 px-4 py-10 text-sm text-muted-foreground sm:px-6">No announcements yet.</div>
                ) : (
                    <div className="max-w-3xl space-y-4">
                        {announcements.map((announcement, index) => {
                            const slug = announcementSlug(announcement.title, announcement.id);
                            return (
                                <article id={slug} key={announcement.id} className="scroll-mt-24 rounded-lg bg-card/60 px-4 py-6 sm:px-6 sm:py-7">
                                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <div className="flex min-w-0 items-center gap-2">
                                            {index === 0 && <span className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">Latest</span>}
                                            <h3 className="text-base font-semibold tracking-tight text-foreground">
                                                <a href={`#${slug}`} className="underline decoration-border underline-offset-4 hover:decoration-primary">
                                                    {announcement.title}
                                                </a>
                                            </h3>
                                        </div>
                                        <time className="text-xs tabular-nums text-muted-foreground" dateTime={new Date(announcement.created_at).toISOString()}>
                                            {new Date(announcement.created_at).toLocaleDateString("en", {
                                                dateStyle: "medium",
                                                timeZone: "UTC",
                                            })}
                                        </time>
                                    </div>
                                    <div className="whitespace-pre-wrap text-sm leading-6 text-foreground/85">{announcement.content}</div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section id="changelog" className="mt-12 scroll-mt-24 border-t border-border pt-8" aria-labelledby="changelog-title">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="changelog-title" className="font-display text-xl font-semibold tracking-tight text-foreground">
                        Changelog
                    </h2>
                    <p className="text-xs text-muted-foreground">Features, fixes, and improvements by release</p>
                </div>
                {releases.length === 0 ? (
                    <div className="rounded-lg bg-card/60 px-4 py-10 text-sm text-muted-foreground sm:px-6">No release notes available.</div>
                ) : (
                    <div className="max-w-3xl space-y-4">
                        {releases.map((release, index) => {
                            const slug = releaseSlug(release.version);
                            return (
                                <article id={slug} key={release.version} className="scroll-mt-24 rounded-lg bg-card/60 px-4 py-5 sm:px-6">
                                    <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                                            <a href={`#${slug}`} className="underline decoration-border underline-offset-4 hover:decoration-primary">
                                                {release.version}
                                            </a>
                                        </h3>
                                        {index === 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">Latest</span>}
                                        <time className="text-xs tabular-nums text-muted-foreground" dateTime={new Date(release.date).toISOString()}>
                                            {release.date}
                                        </time>
                                    </header>
                                    <ul className="space-y-2.5">
                                        {release.changes.map((change, changeIndex) => (
                                            <li key={`${release.version}-${changeIndex}`} className="flex items-start gap-2 text-sm leading-6 text-foreground/85">
                                                <span className="mt-0.5 text-primary" aria-hidden="true">
                                                    •
                                                </span>
                                                <span className="min-w-0 flex-1">{change.description}</span>
                                                {change.commit && (
                                                    <a
                                                        className="shrink-0 text-xs text-primary hover:underline"
                                                        href={`https://github.com/hanami-osu/osu-guessr/commit/${change.commit}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Commit
                                                    </a>
                                                )}
                                                {change.pr && (
                                                    <a
                                                        className="shrink-0 text-xs text-primary hover:underline"
                                                        href={`https://github.com/hanami-osu/osu-guessr/pull/${change.pr}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        PR #{change.pr}
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
