import { GameMediaProps } from "../types/props";

export const ResultMessage = ({ result }: { result: GameMediaProps["result"] }) => {
    if (!result) return null;

    let message = "";
    let colorClass = "";

    switch (result.type) {
        case "guess":
            message = result.correct ? "Correct Guess!" : "Wrong Guess!";
            colorClass = result.correct ? "text-green-500" : "text-destructive";
            break;
        case "timeout":
            message = "Time's Up!";
            colorClass = "text-destructive";
            break;
        case "skip":
            message = "Skipped";
            colorClass = "text-yellow-500";
            break;
    }

    return <div className={`text-2xl font-bold mb-4 ${colorClass}`}>{message}</div>;
};
