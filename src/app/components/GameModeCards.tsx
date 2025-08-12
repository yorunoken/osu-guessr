"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslationsContext } from "@/context/translations-provider";
import { gameRegistry } from "@/lib/game/registry";

export default function GameModeCards() {
    const { t } = useTranslationsContext();
    const gameModes = gameRegistry.getAllModes();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    } as const;

    return (
        <section className="py-24 bg-background" id="gamemodes">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-4xl font-bold text-center mb-16 text-foreground"
                >
                    {t.gameModes.title}
                </motion.h2>

                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {gameModes.map((mode, index) => (
                        <motion.div key={index} variants={cardVariants} viewport={{ once: true }} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                            <Link href={mode.url} className="block">
                                <div className="relative h-80 rounded-xl overflow-hidden bg-card border border-border/50 transition-all duration-300">
                                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                                        <Image src={mode.image || "/placeholder.svg"} alt={t.gameModes.modes[mode.id].title} layout="fill" objectFit="cover" className="opacity-60 transition-all duration-300" />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                                    <motion.div
                                        className="absolute inset-0 flex flex-col justify-end p-8"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                    >
                                        <h3 className="text-2xl font-bold mb-3 text-primary">{t.gameModes.modes[mode.id].title}</h3>
                                        <p className="text-foreground/70 text-sm leading-relaxed">{t.gameModes.modes[mode.id].description}</p>
                                    </motion.div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
