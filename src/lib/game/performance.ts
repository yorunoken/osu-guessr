export interface PerformanceMetrics {
    gameStart: number;
    roundStart: number;
    guessSubmitted: number;
    roundEnd: number;
    gameEnd: number;
    networkRequests: {
        count: number;
        totalTime: number;
        errors: number;
    };
}

export interface GameAnalytics {
    sessionId: string;
    gameMode: string;
    variant: string;
    startTime: number;
    endTime?: number;
    totalRounds: number;
    correctGuesses: number;
    averageResponseTime: number;
    performanceMetrics: PerformanceMetrics;
    errors: Array<{
        timestamp: number;
        error: string;
        action: string;
    }>;
}

export class GamePerformanceMonitor {
    private metrics: PerformanceMetrics;
    private analytics: GameAnalytics;
    private roundStartTime: number = 0;

    constructor(sessionId: string, gameMode: string, variant: string) {
        this.metrics = {
            gameStart: 0,
            roundStart: 0,
            guessSubmitted: 0,
            roundEnd: 0,
            gameEnd: 0,
            networkRequests: {
                count: 0,
                totalTime: 0,
                errors: 0,
            },
        };

        this.analytics = {
            sessionId,
            gameMode,
            variant,
            startTime: Date.now(),
            totalRounds: 0,
            correctGuesses: 0,
            averageResponseTime: 0,
            performanceMetrics: this.metrics,
            errors: [],
        };
    }

    markGameStart(): void {
        this.metrics.gameStart = performance.now();
    }

    markRoundStart(): void {
        this.metrics.roundStart = performance.now();
        this.roundStartTime = Date.now();
    }

    markGuessSubmitted(): void {
        this.metrics.guessSubmitted = performance.now();
    }

    markRoundEnd(correct: boolean): void {
        this.metrics.roundEnd = performance.now();
        this.analytics.totalRounds++;

        if (correct) {
            this.analytics.correctGuesses++;
        }

        const responseTime = Date.now() - this.roundStartTime;
        const totalTime = this.analytics.averageResponseTime * (this.analytics.totalRounds - 1) + responseTime;
        this.analytics.averageResponseTime = totalTime / this.analytics.totalRounds;
    }

    markGameEnd(): void {
        this.metrics.gameEnd = performance.now();
        this.analytics.endTime = Date.now();
    }

    recordNetworkRequest(duration: number, success: boolean): void {
        this.metrics.networkRequests.count++;
        this.metrics.networkRequests.totalTime += duration;

        if (!success) {
            this.metrics.networkRequests.errors++;
        }
    }

    recordError(error: string, action: string): void {
        this.analytics.errors.push({
            timestamp: Date.now(),
            error,
            action,
        });
    }

    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    getAnalytics(): GameAnalytics {
        return { ...this.analytics };
    }

    getRoundPerformance(): {
        setupTime: number;
        responseTime: number;
        processingTime: number;
    } {
        return {
            setupTime: this.metrics.roundStart - this.metrics.gameStart,
            responseTime: this.metrics.guessSubmitted - this.metrics.roundStart,
            processingTime: this.metrics.roundEnd - this.metrics.guessSubmitted,
        };
    }

    async sendAnalytics(): Promise<void> {
        try {
            console.log("Game Analytics:", this.analytics);
            // await fetch('/api/analytics', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(this.analytics)
            // });
        } catch (error) {
            console.warn("Failed to send analytics:", error);
        }
    }
}
