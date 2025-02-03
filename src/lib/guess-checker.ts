import { gestaltPattern, levenshteinSimilarity } from "./stringComputing";

export enum GuessDifficulty {
    Easy = 0.5,
    Hard = 0.75,
    Impossible = 0.95,
}

export function checkGuess(guess: string, actual: string, difficulty: GuessDifficulty = 0.5): boolean {
    console.log({ guess, actual, difficulty });
    const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, "");

    guess = normalizeString(guess);
    actual = normalizeString(actual);

    if (guess === actual) {
        console.log("normalized equals");
        return true;
    }

    if (levenshteinSimilarity(guess, actual) > difficulty || gestaltPattern(guess, actual) > difficulty + 0.1) {
        console.log("Levenshtein ", levenshteinSimilarity(guess, actual));
        console.log("gestaltPattern ", gestaltPattern(guess, actual));
        return true;
    }

    return false;
}
