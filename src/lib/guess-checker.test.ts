import { expect, test, describe } from "bun:test";
import { checkGuess, GuessDifficulty } from "./guess-checker";

describe("Guess Checker", () => {
    describe("checkGuess", () => {
        test("exact match", () => {
            expect(checkGuess("hello world", "hello world")).toBe(true);
        });

        test("case insensitivity", () => {
            expect(checkGuess("Hello World", "hello world")).toBe(true);
            expect(checkGuess("HELLO WORLD", "hello world")).toBe(true);
        });

        test("removes special characters", () => {
            expect(checkGuess("hello world!", "hello world")).toBe(true);
            expect(checkGuess("hello-world", "hello world")).toBe(true);
        });

        test("handles parentheses in actual answer", () => {
            expect(checkGuess("my song", "my song (TV Size)")).toBe(true);
            expect(checkGuess("my song tv size", "my song (TV Size)")).toBe(true);
        });

        test("handles feat/ft in actual answer", () => {
            expect(checkGuess("cool track", "cool track feat. Hatsune Miku")).toBe(true);
            expect(checkGuess("cool track", "cool track ft. Hatsune Miku")).toBe(true);
            expect(checkGuess("cool track", "cool track feat Hatsune Miku")).toBe(true);
        });

        test("fuzzy matching with levenshtein", () => {
            // "night of nights" vs "night of knight"
            expect(checkGuess("night of knight", "night of nights", GuessDifficulty.Easy)).toBe(true);
        });

        test("fuzzy matching shouldn't allow completely wrong answers", () => {
            expect(checkGuess("darude sandstorm", "rick astley never gonna give you up")).toBe(false);
        });

        test("difficulty thresholds", () => {
            // "abcdefgh" vs "abcdefxy" -> 6/8 = 0.75 similarity
            // Easy is 0.5, Hard is 0.7, Impossible is 0.95
            expect(checkGuess("abcdefxy", "abcdefgh", GuessDifficulty.Easy)).toBe(true);
            expect(checkGuess("abcdefxy", "abcdefgh", GuessDifficulty.Hard)).toBe(true);
            expect(checkGuess("abcdefxy", "abcdefgh", GuessDifficulty.Impossible)).toBe(false);
        });
    });
});
