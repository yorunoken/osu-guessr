import { z } from "zod";

// Common validation schemas
export const gameSessionSchema = z.object({
    sessionId: z.string().uuid(),
    gameMode: z.enum(["audio", "background", "skin"]),
    variant: z.enum(["classic", "death"]),
});

export const guessSchema = z.object({
    guess: z.string().min(1, "Guess cannot be empty").max(200, "Guess is too long").trim(),
});

export const userInputSchema = z.object({
    search: z
        .string()
        .max(100, "Search query is too long")
        .regex(/^[a-zA-Z0-9\s\-_'".!?]+$/, "Invalid characters in search query")
        .trim(),
});

// Sanitization functions
export function sanitizeHtml(input: string): string {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}

export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>\"'&]/g, "") // Remove potentially dangerous characters
        .slice(0, 500); // Limit length
}

export function validateAndSanitizeGuess(guess: string): string {
    const sanitized = sanitizeInput(guess);
    const result = guessSchema.safeParse({ guess: sanitized });

    if (!result.success) {
        throw new Error(`Invalid guess: ${result.error.issues[0].message}`);
    }

    return result.data.guess;
}

export function validateGameSession(data: unknown) {
    const result = gameSessionSchema.safeParse(data);

    if (!result.success) {
        throw new Error(`Invalid game session: ${result.error.issues[0].message}`);
    }

    return result.data;
}

// Rate limiting
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    constructor(
        private maxRequests: number = 10,
        private windowMs: number = 60000 // 1 minute
    ) {}

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // Get existing requests for this identifier
        const requests = this.requests.get(identifier) || [];

        // Filter out old requests
        const recentRequests = requests.filter((time) => time > windowStart);

        // Check if limit exceeded
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }

        // Add current request
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);

        return true;
    }

    getRemainingRequests(identifier: string): number {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        const requests = this.requests.get(identifier) || [];
        const recentRequests = requests.filter((time) => time > windowStart);

        return Math.max(0, this.maxRequests - recentRequests.length);
    }

    getResetTime(identifier: string): number {
        const requests = this.requests.get(identifier) || [];
        if (requests.length === 0) return 0;

        const oldestRequest = Math.min(...requests);
        return oldestRequest + this.windowMs;
    }
}
