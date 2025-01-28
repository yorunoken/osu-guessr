import { Button } from "@/components/ui/button";
import { forwardRef, ForwardedRef } from "react";

interface GuessInputProps {
    guess: string;
    setGuess: (guess: string) => void;
    isRevealed: boolean;
    onGuess: () => void;
    onSkip: () => void;
}

const GuessInput = forwardRef<HTMLInputElement, GuessInputProps>(({ guess, setGuess, isRevealed, onGuess, onSkip }, ref: ForwardedRef<HTMLInputElement>) => {
    return (
        <div className="bg-card p-6 rounded-xl border border-border/50">
            <h2 className="text-xl font-semibold mb-4">Enter your guess:</h2>
            <input
                type="text"
                ref={ref}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="w-full p-3 rounded-lg bg-secondary text-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Song title..."
                disabled={isRevealed}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !isRevealed) {
                        onGuess();
                    }
                }}
            />
            <div className="flex gap-4 mt-4">
                <Button className="flex-1" onClick={onGuess} disabled={!guess || isRevealed}>
                    Submit
                </Button>
                <Button variant="outline" onClick={onSkip} disabled={isRevealed}>
                    Skip (-50 points)
                </Button>
            </div>
        </div>
    );
});

GuessInput.displayName = "GuessInput";

export default GuessInput;
