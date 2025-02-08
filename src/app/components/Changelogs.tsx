import { motion } from "framer-motion";
import { useTranslationsContext } from "@/context/translations-provider";
import { Changelog } from "../HomeContent";

interface ChangelogsProps {
    changelogs: Array<Changelog>;
}

export function ChangelogsSection({ changelogs }: ChangelogsProps) {
    const { t } = useTranslationsContext();
    const sortedChangelogs = [...changelogs].reverse();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.4,
                when: "beforeChildren",
                staggerChildren: 0.05, // Reduced stagger time
            },
        },
    };

    const changelogVariants = {
        hidden: {
            opacity: 0,
            y: 5, // Reduced y offset
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <div className="container mx-auto px-4">
            <motion.div
                className="bg-card rounded-xl p-6 border border-border/50"
                initial="hidden"
                animate="visible" // Changed from whileInView to animate
                variants={containerVariants}
            >
                <motion.h2 className="text-2xl font-bold mb-6 text-center" variants={changelogVariants}>
                    {t.home.updates.title}
                </motion.h2>

                <div className="space-y-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {sortedChangelogs.map((log, i) => (
                        <motion.div key={i} className="border-b border-border/50 last:border-0 pb-6 last:pb-0" variants={changelogVariants}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg font-semibold">{log.version}</span>
                                <span className="text-sm text-foreground/70">• {log.date}</span>
                            </div>

                            <ul className="space-y-2">
                                {log.changes.map((change, j) => (
                                    <motion.li key={j} className="text-foreground/80 flex items-start gap-2" variants={changelogVariants}>
                                        <span className="text-primary">•</span>
                                        <span>{change.description}</span>
                                        <div className="space-x-2 text-sm">
                                            {change.commit && (
                                                <motion.a
                                                    href={`https://github.com/yorunoken/osu-guessr/commit/${change.commit}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-block"
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    [commit]
                                                </motion.a>
                                            )}
                                            {change.pr && (
                                                <motion.a
                                                    href={`https://github.com/yorunoken/osu-guessr/pull/${change.pr}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-block"
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    [PR #{change.pr}]
                                                </motion.a>
                                            )}
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
