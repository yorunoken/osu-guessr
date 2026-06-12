import { expect, test, describe, mock, beforeEach, beforeAll } from "bun:test";
import { GameMode } from "@/actions/types";

Object.assign(process.env, {
    DATABASE_URL: "mysql://root@localhost:3306/test",
    REDIS_URL: "redis://localhost:6379",
    AUTH_SECRET: "test",
    OSU_CLIENT_ID: "test",
    OSU_CLIENT_SECRET: "test",
    OSU_API_KEY: "test",
});

// Mock the dependencies before importing GameClient
mock.module("@/actions/game-server", () => ({
    startGameAction: mock(async () => ({
        sessionId: "mock-session-id",
        timeLeft: 10,
        gameStatus: "active",
        score: { total: 0, current: 0, streak: 0, highestStreak: 0 },
        rounds: { current: 1, total: 10, correctGuesses: 0, totalTimeUsed: 0 },
        currentBeatmap: { revealed: false }
    })),
    submitGuessAction: mock(async () => ({
        sessionId: "mock-session-id",
        timeLeft: 10,
        gameStatus: "active",
        score: { total: 100, current: 100, streak: 1, highestStreak: 1 },
        rounds: { current: 2, total: 10, correctGuesses: 1, totalTimeUsed: 0 },
        currentBeatmap: { revealed: false },
        lastGuess: { correct: true, answer: "correct answer", type: "guess" }
    })),
    endGameAction: mock(async () => {}),
    getGameStateAction: mock(async () => ({})),
    getSuggestionsAction: mock(async () => []),
}));

mock.module("@/lib/game/sounds", () => ({
    soundManager: {
        play: mock(() => {}),
        setVolume: mock(() => {}),
    }
}));

let GameClient: typeof import("./client").GameClient;

describe("GameClient", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let events: any;

    beforeAll(async () => {
        ({ GameClient } = await import("./client"));
    });
    
    beforeEach(() => {
        events = {
            onStateUpdate: mock(),
            onError: mock(),
            onRetry: mock(),
            onRecovery: mock(),
        };
    });

    test("initializes correctly", () => {
        const client = new GameClient(events, GameMode.Audio, "classic");
        expect(client.getStatus()).toBe("idle");
    });

    test("setVolume enforces bounds", () => {
        const client = new GameClient(events, GameMode.Audio, "classic");
        client.setVolume(1.5);
        expect(client.getVolume()).toBe(1);
        
        client.setVolume(-0.5);
        expect(client.getVolume()).toBe(0);
        
        client.setVolume(0.5);
        expect(client.getVolume()).toBe(0.5);
    });

    test("startGame transitions status", async () => {
        const client = new GameClient(events, GameMode.Audio, "classic");
        await client.startGame();
        
        expect(client.getStatus()).toBe("active");
    });
});
