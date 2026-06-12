import { gestaltPattern, levenshteinSimilarity } from "./string-computing";

export enum GuessDifficulty {
    Easy = 0.5,
    Hard = 0.7,
    Impossible = 0.95,
}

function normalizeString(str: string): string {
    // 1. Convert to lowercase
    let normalized = str.toLowerCase();

    // 2. Remove anything inside parentheses (e.g. "(TV Size)")
    normalized = normalized.replace(/\(.*?\)/g, "");

    // 3. Remove "feat.*" and "ft.*" and anything that follows it
    normalized = normalized.replace(/\b(?:feat|ft)\.?\b.*/g, "");

    // 4. Remove all characters that are not a-z, 0-9, or space, then trim
    normalized = normalized.replace(/[^a-z0-9\s]/g, "").trim();

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
