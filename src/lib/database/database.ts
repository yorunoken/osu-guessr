"use server";

import { API_URL } from "../index";
import { QueryOptions, DatabaseError } from "./types";

const DEFAULT_OPTIONS: Required<QueryOptions> = {
    timeout: 30000,
    retries: 3,
    logQuery: true,
};

export async function query<T = unknown>(sql: string, values?: Array<unknown>, options: QueryOptions = {}): Promise<T[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (opts.logQuery) {
        console.log("Executing query:", sql);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= opts.retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

            const response = await fetch(`${API_URL}/api/query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sql,
                    values: values || [],
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new DatabaseError(`Query failed with status ${response.status}: ${errorText}`, sql, values);
            }

            const result = await response.json();
            return result as T[];
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (attempt === opts.retries) {
                break;
            }

            // Wait before retry with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));

            console.warn(`Query attempt ${attempt} failed, retrying in ${delay}ms...`);
        }
    }

    throw new DatabaseError(`Query failed after ${opts.retries} attempts: ${lastError?.message}`, sql, values, lastError || undefined);
}

// Typed query helpers
export async function queryOne<T>(sql: string, values?: Array<unknown>, options?: QueryOptions): Promise<T | null> {
    const results = await query<T>(sql, values, options);
    return results.length > 0 ? results[0] : null;
}

export async function queryFirst<T>(sql: string, values?: Array<unknown>, options?: QueryOptions): Promise<T> {
    const result = await queryOne<T>(sql, values, options);
    if (!result) {
        throw new DatabaseError("Query returned no results", sql, values);
    }
    return result;
}
