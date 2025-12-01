import { gestaltPattern, levenshteinSimilarity } from "./string-computing";

export enum GuessDifficulty {
    Easy = 0.5,
    Hard = 0.7,
    Impossible = 0.95,
}

function normalizeString(str: string): string {
    // First, convert to lowercase once
    let normalized = str.toLowerCase();

    // Remove parentheses content before character filtering
    const openParenIndex = normalized.indexOf("(");
    const closeParenIndex = normalized.lastIndexOf(")");

    if (openParenIndex !== -1 && closeParenIndex !== -1) {
        normalized = normalized.slice(0, openParenIndex) + normalized.slice(closeParenIndex + 1);
    }

    // Remove featuring information
    const featIndex = normalized.indexOf("feat");
    const ftIndex = normalized.indexOf("ft");

    if (featIndex !== -1) {
        normalized = normalized.slice(0, featIndex);
    } else if (ftIndex !== -1) {
        normalized = normalized.slice(0, ftIndex);
    }

    // Apply character filtering and trim only once at the end
    return normalized.replace(/[^a-z0-9\s]/g, "").trim();
}

export function checkGuess(guess: string, actual: string, difficulty: GuessDifficulty = 0.5): boolean {
    guess = normalizeString(guess);
    actual = normalizeString(actual);

    if (guess === actual) {
        return true;
    }

    if (levenshteinSimilarity(guess, actual) > difficulty || gestaltPattern(guess, actual) > difficulty + 0.1) {
        return true;
    }

    return false;
}
