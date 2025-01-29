import { Button } from "@/components/ui/button";
import { forwardRef, ForwardedRef, useState, useEffect, useRef } from "react";
import { GameClient } from "@/lib/game/GameClient";

interface GuessInputProps {
    guess: string;
    setGuess: (guess: string) => void;
    isRevealed: boolean;
    onGuess: () => void;
    onSkip: () => void;
    gameClient: GameClient;
}

const GuessInput = forwardRef<HTMLInputElement, GuessInputProps>(({ guess, setGuess, isRevealed, onGuess, onSkip, gameClient }, ref: ForwardedRef<HTMLInputElement>) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const clickingRef = useRef(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (guess.length >= 2 && !isRevealed) {
                try {
                    const results = await gameClient.getSuggestions(guess);
                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Failed to get suggestions:", error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [guess, isRevealed, gameClient]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                setGuess(suggestions[selectedIndex]);
                setShowSuggestions(false);
            } else if (!isRevealed) {
                onGuess();
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border/50">
            <h2 className="text-xl font-semibold mb-4">Enter your guess:</h2>
            <div className="relative">
                <input
                    type="text"
                    ref={ref}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (!clickingRef.current) {
                            setShowSuggestions(false);
                        }
                    }}
                    onFocus={() => {
                        if (guess.length >= 2) {
                            setShowSuggestions(true);
                        }
                    }}
                    className="w-full p-3 rounded-lg bg-secondary text-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Song title..."
                    disabled={isRevealed}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        className="absolute z-10 w-full mt-1 bg-card border border-border/50 rounded-lg shadow-lg"
                        onMouseDown={() => {
                            clickingRef.current = true;
                        }}
                        onMouseUp={() => {
                            clickingRef.current = false;
                        }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={suggestion}
                                className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${index === selectedIndex ? "bg-primary/20" : ""}`}
                                onClick={() => {
                                    setGuess(suggestion);
                                    setShowSuggestions(false);
                                    clickingRef.current = false;
                                }}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
