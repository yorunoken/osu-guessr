"use server";

import mysql from "mysql2/promise";
import { QueryOptions, DatabaseError } from "./types";

const DEFAULT_OPTIONS: Required<QueryOptions> = {
    timeout: 30000,
    retries: 3,
    logQuery: process.env.NODE_ENV === "production" ? false : true,
};

const connection = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "osu_guessr",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

function sanitizeValues(values?: Array<unknown>): Array<unknown> | undefined {
    if (!values) return values;
    return values.map((value) => (value === undefined ? null : value));
}

export async function query<T = unknown>(sqlQuery: string, values?: Array<unknown>, options: QueryOptions = {}): Promise<T[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const sanitizedValues = sanitizeValues(values);

    if (opts.logQuery) {
        console.log("\n\nExecuting query:", sqlQuery);
        if (sanitizedValues) {
            console.log("With values:", sanitizedValues);
        }

        const stack = new Error().stack;
        if (stack) {
            const stackLines = stack.split("\n");
            const callerLine = stackLines.find((line, index) => index > 0 && !line.includes("database.ts") && line.trim().startsWith("at "));

            if (callerLine) {
                const match = callerLine.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
                if (match) {
                    const [, functionName, filePath, lineNumber] = match;
                    const fileName = filePath.split("/").pop() || filePath;
                    console.log(`Query called from: ${functionName} in ${fileName}:${lineNumber}`);
                } else {
                    console.log(`Query called from: ${callerLine.trim()}`);
                }
            } else {
                console.log("Query called from: Unable to determine caller");
            }
        }
        console.log("\n");
    }

    try {
        const [rows] = await connection.execute(sqlQuery, sanitizedValues);
        return rows as T[];
    } catch (err: unknown) {
        const error = err as Error;
        throw new DatabaseError(`Query failed: ${error.message}`, sqlQuery, sanitizedValues, error);
    }
}

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
