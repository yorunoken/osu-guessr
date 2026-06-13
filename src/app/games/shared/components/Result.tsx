import { GameMediaProps } from "@/lib/game/interfaces";

export const ResultMessage = ({ result }: { result: GameMediaProps["result"] }) => {
    if (!result) return null;

    let message = "";
    let colorClass = "";

    switch (result.type) {
        case "guess":
            if (result.correct) {
                message = "Correct Guess!";
                colorClass = "text-green-500";
            } else {
                message = "Wrong Guess!";
                colorClass = "text-destructive";
            }
            break;
        case "skip":
            message = "Skipped";
            colorClass = "text-yellow-500";
            break;
        case "timeout":
            message = "Time's Up!";
            colorClass = "text-destructive";
            break;
    }

    return <div className={`text-2xl font-bold mb-4 ${colorClass}`}>{message}</div>;
};
