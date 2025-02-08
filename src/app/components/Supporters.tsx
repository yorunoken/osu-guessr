import { motion } from "framer-motion";
import { SupportPageLink } from "@/components/SupportDialogWrapper";
import { supporters } from "@/config/supporters";
import { useTranslationsContext } from "@/context/translations-provider";
import React from "react";

const StyledGameName = () => (
    <motion.span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        osu!guessr
    </motion.span>
);

export function SupportersSection() {
    const { t } = useTranslationsContext();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3,
            },
        },
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 10,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
            },
        },
    };

    return (
        <motion.div className="container mx-auto px-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
            <motion.div className="flex flex-col items-center gap-4 mb-8" initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <h2 className="text-3xl font-bold text-center">{t.home.supporters.title}</h2>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                    <SupportPageLink />
                </motion.div>
            </motion.div>

            {supporters.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                >
                    {supporters.map((supporter, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover={{
                                y: -2,
                                transition: { duration: 0.2 },
                            }}
                            className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
                        >
                            <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                <div className="font-semibold">
                                    {supporter.url ? (
                                        <motion.a
                                            href={supporter.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary transition-colors"
                                            whileHover={{ x: 2 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {supporter.name}
                                        </motion.a>
                                    ) : (
                                        supporter.name
                                    )}
                                </div>
                                <motion.div className="text-sm text-primary" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.2 }}>
                                    ${supporter.amount}
                                </motion.div>
                            </motion.div>
                            {supporter.message && (
                                <motion.p className="text-sm text-foreground/70 italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }}>
                                    {'"'}
                                    {supporter.message}
                                    {'"'}
                                </motion.p>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div className="text-center text-foreground/70" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <p>
                        {t.home.supporters.beFirst.split("{osu_guessr}").map((part: string, index: number, array: string[]) => (
                            <React.Fragment key={index}>
                                {part}
                                {index < array.length - 1 && <StyledGameName />}
                            </React.Fragment>
                        ))}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
