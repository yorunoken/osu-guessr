import { gestaltPattern, levenshteinSimilarity } from "./string-computing";

export enum GuessDifficulty {
    Easy = 0.5,
    Hard = 0.7,
    Impossible = 0.95,
}

function normalizeString(str: string): string {
    let normalized = str.toLowerCase().replace(/[^a-z0-9\s]/g, "");

    const openParenIndex = str.indexOf("(");
    const closeParenIndex = str.lastIndexOf(")");

    if (openParenIndex !== -1 && closeParenIndex !== -1) {
        normalized = str.slice(0, openParenIndex) + str.slice(closeParenIndex + 1);
    }

    const featIndex = normalized.indexOf("feat");
    const ftIndex = normalized.indexOf("ft");

    if (featIndex !== -1) {
        normalized = normalized.slice(0, featIndex);
    } else if (ftIndex !== -1) {
        normalized = normalized.slice(0, ftIndex);
    }

    normalized = normalized
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

    return normalized;
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
