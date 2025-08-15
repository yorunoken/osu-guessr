import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { GameClient } from "@/lib/game/client";
import { useTranslationsContext } from "@/context/translations-provider";
import { motion, AnimatePresence } from "framer-motion";
import { soundManager } from "@/lib/game/sounds";

interface GuessInputProps {
    guess: string;
    setGuess: (guess: string) => void;
    isRevealed: boolean;
    onGuess: () => void;
    onSkip: () => void;
    gameClient: GameClient;
}

export default function GuessInput({ guess, setGuess, isRevealed, onGuess, onSkip, gameClient }: GuessInputProps) {
    const { t } = useTranslationsContext();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const clickingRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSelectingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isRevealed && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isRevealed]);

    useEffect(() => {
        if (!guess) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }
    }, [guess]);

    useEffect(() => {
        if (!isSelectingRef.current && guess.trim() && !isRevealed) {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(async () => {
                const newSuggestions = await gameClient.getSuggestions(guess);
                setSuggestions(newSuggestions);
                setShowSuggestions(true);
                setSelectedIndex(newSuggestions.length > 0 ? 0 : -1);
            }, 100);
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [guess, gameClient, isRevealed]);

    useEffect(() => {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        isSelectingRef.current = false;
    }, [isRevealed]);

    useEffect(() => {
        if (suggestions.length > 0) {
            setSelectedIndex(0);
        } else {
            setSelectedIndex(-1);
        }
    }, [suggestions]);

    const handleSubmit = () => {
        soundManager.play("click");
        onGuess();
    };

    const handleSkip = () => {
        soundManager.play("skip");
        onSkip();
    };

    const handleSuggestionSelect = (suggestion: string) => {
        if (isRevealed) return;

        isSelectingRef.current = true;
        setGuess(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
        setTimeout(() => {
            isSelectingRef.current = false;
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isRevealed) return;

        if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSkip();
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, -1));
                break;
            case "Tab":
                if (suggestions.length > 0) {
                    e.preventDefault();
                    const nextIndex = e.shiftKey ? (selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1) : selectedIndex >= suggestions.length - 1 ? 0 : selectedIndex + 1;
                    setSelectedIndex(nextIndex);
                }
                break;
            case "Enter":
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionSelect(suggestions[selectedIndex]);
                } else if (!isRevealed) {
                    handleSubmit();
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                break;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setGuess(v);
        if (!isSelectingRef.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-xl border border-border/50">
            <h2 className="text-xl font-semibold mb-4">{t.game.input.title}</h2>
            <div className="relative">
                <input
                    type="text"
                    ref={inputRef}
                    value={guess}
                    onChange={handleChange}
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
                    placeholder={t.game.input.placeholder}
                    disabled={isRevealed}
                />

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute w-full mt-1 bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden z-50"
                        >
                            <div className="max-h-[300px] overflow-y-auto backdrop-blur-sm">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={suggestion}
                                        className={`px-4 py-2 cursor-pointer transition-colors duration-150
                                               ${index === selectedIndex ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/50"}`}
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex gap-4 mt-4">
                <Button className="flex-1" onClick={onGuess} disabled={!guess || isRevealed}>
                    {t.game.input.submit}
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button variant="outline" onClick={handleSkip} disabled={isRevealed} className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors">
                        {t.game.input.skip}
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}
