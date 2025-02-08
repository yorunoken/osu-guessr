import { GameMediaProps } from "../types/props";
import { motion } from "framer-motion";

export const ResultMessage = ({ result }: { result: GameMediaProps["result"] }) => {
    if (!result) return null;

    const variants = {
        correct: {
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 },
        },
        wrong: {
            x: [-10, 10, -10, 10, 0],
            transition: { duration: 0.5 },
        },
        skip: {
            y: [-10, 0],
            opacity: [0, 1],
            transition: { duration: 0.3 },
        },
        timeout: {
            scale: [1, 0.95, 1],
            opacity: [0, 1],
            transition: { duration: 0.4 },
        },
    };

    let message = "";
    let colorClass = "";
    let animation = "correct";

    switch (result.type) {
        case "guess":
            if (result.correct) {
                message = "Correct Guess!";
                colorClass = "text-green-500";
                animation = "correct";
            } else {
                message = "Wrong Guess!";
                colorClass = "text-destructive";
                animation = "wrong";
            }
            break;
        case "skip":
            message = "Skipped";
            colorClass = "text-yellow-500";
            animation = "skip";
            break;
        case "timeout":
            message = "Time's Up!";
            colorClass = "text-destructive";
            animation = "timeout";
            break;
    }

    return (
        <motion.div variants={variants} animate={animation} className={`text-2xl font-bold mb-4 ${colorClass}`}>
            {message}
        </motion.div>
    );
};
