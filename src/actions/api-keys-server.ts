"use server";

import { authenticatedAction } from "./server";
import { query } from "@/lib/database";
import crypto from "crypto";

export interface ApiKey {
    id: string;
    name: string;
    created_at: Date;
    last_used: Date | null;
    user_id: number;
}

function hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export async function createApiKeyAction(name: string): Promise<string> {
    return authenticatedAction(async (session) => {
        const [result] = await query(`SELECT COUNT(*) as count FROM api_keys WHERE user_id = ?`, [session.user.banchoId]);

        if (result.count >= 5) {
            throw new Error("Maximum number of API keys (5) reached");
        }

        const apiKey = crypto.randomBytes(32).toString("hex");
        const hashedKey = hashApiKey(apiKey);

        await query(`INSERT INTO api_keys (id, user_id, name) VALUES (?, ?, ?)`, [hashedKey, session.user.banchoId, name]);

        return apiKey;
    });
}

export async function listApiKeysAction() {
    return authenticatedAction(async (session) => {
        const keys: Array<ApiKey> = await query(
            `SELECT id, name, created_at, last_used
                FROM api_keys
                WHERE user_id = ?
                ORDER BY created_at DESC`,
            [session.user.banchoId],
        );

        return keys;
    });
}

export async function deleteApiKeyAction(keyId: string): Promise<void> {
    return authenticatedAction(async (session) => {
        await query(
            `DELETE FROM api_keys
            WHERE id = ? AND user_id = ?`,
            [keyId, session.user.banchoId],
        );
    });
}

export async function validateApiKey(apiKey?: string | null): Promise<number> {
    if (!apiKey) {
        throw new Error("API key was not provided.");
    }

    const hashedKey = hashApiKey(apiKey);
    const [key] = await query(`SELECT user_id FROM api_keys WHERE id = ?`, [hashedKey]);

    if (!key) {
        throw new Error("Invalid API key");
    }

    await query(`UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?`, [hashedKey]);

    return key.user_id;
}
