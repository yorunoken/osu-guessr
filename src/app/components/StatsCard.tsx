import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

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
    } as const;

    const contentVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.1,
                duration: 0.3,
            },
        },
    };

    const numberVariants = {
        hidden: {
            opacity: 0,
            y: 5,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                duration: 0.3,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="bg-card rounded-xl p-6 border border-border/50 transition-colors duration-200 hover:bg-card/80"
        >
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">{icon}</div>
                <motion.div variants={contentVariants}>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <motion.p variants={numberVariants} className="text-3xl font-bold text-primary">
                        {value}
                    </motion.p>
                    <p className="text-sm text-foreground/70 mt-1">{description}</p>
                </motion.div>
            </div>
        </motion.div>
    );
}
