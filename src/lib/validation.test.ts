import { expect, test, describe } from "bun:test";
import { sanitizeHtml, validateAndSanitizeGuess, validateGameSession, RateLimiter } from "./validation";

describe("Validation", () => {
    describe("sanitizeHtml", () => {
        test("escapes HTML characters", () => {
            const input = '<script>alert("hello & world\'/test")</script>';
            const expected = '&lt;script&gt;alert(&quot;hello &amp; world&#x27;&#x2F;test&quot;)&lt;&#x2F;script&gt;';
            expect(sanitizeHtml(input)).toBe(expected);
        });

        test("leaves safe strings untouched", () => {
            expect(sanitizeHtml("hello world")).toBe("hello world");
        });
    });

    describe("validateAndSanitizeGuess", () => {
        test("trims and sanitizes", () => {
            expect(validateAndSanitizeGuess("  hello  ")).toBe("hello");
            expect(validateAndSanitizeGuess("<script>")).toBe("script"); // removes <> 
        });

        test("throws on empty guess after trim", () => {
            expect(() => validateAndSanitizeGuess("   ")).toThrow();
        });

        test("throws on too long guess", () => {
            const longString = "a".repeat(300);
            expect(() => validateAndSanitizeGuess(longString)).toThrow(); // because slice truncates it, wait, validation checks max(200). Slice is 500, so it will throw.
        });
    });

    describe("validateGameSession", () => {
        test("validates correctly", () => {
            const valid = {
                sessionId: "123e4567-e89b-12d3-a456-426614174000",
                gameMode: "audio" as const,
                variant: "classic" as const,
            };
            expect(validateGameSession(valid)).toEqual(valid);
        });

        test("throws on invalid uuid", () => {
            expect(() => validateGameSession({ sessionId: "123", gameMode: "audio", variant: "classic" })).toThrow();
        });

        test("throws on invalid gameMode", () => {
            expect(() => validateGameSession({ sessionId: "123e4567-e89b-12d3-a456-426614174000", gameMode: "invalid", variant: "classic" })).toThrow();
        });
    });

    describe("RateLimiter", () => {
        test("allows requests under the limit", () => {
            const limiter = new RateLimiter(5, 10000);
            for (let i = 0; i < 5; i++) {
                expect(limiter.isAllowed("user1")).toBe(true);
            }
        });

        test("blocks requests over the limit", () => {
            const limiter = new RateLimiter(2, 10000);
            expect(limiter.isAllowed("user2")).toBe(true);
            expect(limiter.isAllowed("user2")).toBe(true);
            expect(limiter.isAllowed("user2")).toBe(false); // Third request blocked
        });

        test("getRemainingRequests is accurate", () => {
            const limiter = new RateLimiter(3, 10000);
            expect(limiter.getRemainingRequests("user3")).toBe(3);
            limiter.isAllowed("user3");
            expect(limiter.getRemainingRequests("user3")).toBe(2);
        });
    });
});
