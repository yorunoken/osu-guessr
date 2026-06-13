function isDecimalLike(value: unknown): value is { toNumber: () => number; d: unknown[]; e: number; s: number } {
    if (value === null || typeof value !== "object") {
        return false;
    }

    const maybeDecimal = value as { toNumber?: unknown; d?: unknown; e?: unknown; s?: unknown };

    return typeof maybeDecimal.toNumber === "function" && Array.isArray(maybeDecimal.d) && typeof maybeDecimal.e === "number" && typeof maybeDecimal.s === "number";
}

export function normalizeDatabaseValue(value: unknown): unknown {
    if (typeof value === "bigint") {
        return Number(value);
    }

    if (isDecimalLike(value)) {
        return value.toNumber();
    }

    if (value instanceof Date || value === null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(normalizeDatabaseValue);
    }

    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, normalizeDatabaseValue(nestedValue)]));
}
