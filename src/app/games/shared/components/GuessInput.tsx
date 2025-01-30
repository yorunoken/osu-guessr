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
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSelectingRef = useRef(false);

    useEffect(() => {
        if (!isSelectingRef.current && guess.trim()) {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(async () => {
                const newSuggestions = await gameClient.getSuggestions(guess);
                setSuggestions(newSuggestions);
                setShowSuggestions(true);
                setSelectedIndex(-1);
            }, 300);
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [guess, gameClient]);

    const handleSuggestionSelect = (suggestion: string) => {
        isSelectingRef.current = true;
        setGuess(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
        setTimeout(() => {
            isSelectingRef.current = false;
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSuggestionSelect(suggestions[selectedIndex]);
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
                    onFocus={() => setShowSuggestions(!!guess)}
                    onBlur={() => {
                        requestAnimationFrame(() => {
                            if (!clickingRef.current) {
                                setShowSuggestions(false);
                            }
                        });
                    }}
                    className="w-full p-3 rounded-lg bg-secondary text-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Song title..."
                    disabled={isRevealed}
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute w-full mt-1 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-50 transition-all duration-200 ease-in-out">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={suggestion}
                                className={`px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-secondary/50 ${index === selectedIndex ? "bg-secondary text-primary font-medium" : ""}`}
                                onMouseDown={() => {
                                    clickingRef.current = true;
                                }}
                                onMouseUp={() => {
                                    clickingRef.current = false;
                                    handleSuggestionSelect(suggestion);
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
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
