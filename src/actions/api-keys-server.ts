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

export async function createApiKeyAction(name: string): Promise<string> {
    return authenticatedAction(async (session) => {
        const [result] = await query(`SELECT COUNT(*) as count FROM api_keys WHERE user_id = ?`, [session.user.banchoId]);

        if (result.count >= 5) {
            throw new Error("Maximum number of API keys (5) reached");
        }

        const apiKey = crypto.randomBytes(32).toString("hex");
        await query(`INSERT INTO api_keys (id, user_id, name) VALUES (?, ?, ?)`, [apiKey, session.user.banchoId, name]);

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

    const [key] = await query(`SELECT user_id FROM api_keys WHERE id = ?`, [apiKey]);

    if (!key) {
        throw new Error("Invalid API key");
    }

    await query(`UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?`, [apiKey]);

    return key.user_id;
}
