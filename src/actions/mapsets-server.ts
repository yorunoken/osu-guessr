"use server";

import { query } from "@/lib/database";
import redisClient from "@/lib/redis";
import { authenticatedAction } from "./server";
import { getCachedMediaFile } from "@/lib/media-cache";

import type { MapsetTags, MapsetData, MapsetDataWithTags, SkinData } from "./types";

export async function getRandomAudioAction(sessionId?: string) {
    return authenticatedAction(async () => {
        const audio = await getRandomAudio(sessionId);
        if (!audio) {
            throw new Error("No audio found");
        }

        const audioData = await getCachedMediaFile("audio", audio.audio_filename);

        return {
            data: audio,
            audioData,
        };
    });
}

async function getRandomAudio(sessionId?: string): Promise<MapsetDataWithTags | null> {
    let excludedIds: number[] = [];
    if (sessionId) {
        const cacheKey = `session_items:${sessionId}:mapset`;
        const cachedRaw = await redisClient.sMembers(cacheKey);
        const cached = Array.isArray(cachedRaw) ? cachedRaw : [];
        if (cached.length > 0) {
            excludedIds = cached.map((id) => Number(id)).filter(Boolean);
        }
    }

    // Get total count first for efficient random selection
    const countResults: Array<{ count: number }> = await query(
        `SELECT COUNT(*) as count FROM mapset_tags
            WHERE audio_filename IS NOT NULL
            AND mapset_id NOT IN (${excludedIds.length ? excludedIds.map(() => "?").join(",") : "0"})`,
        excludedIds
    );

    const totalCount = countResults[0]?.count || 0;
    if (totalCount === 0) {
        return null;
    }

    // Use random offset instead of ORDER BY RAND() for better performance
    const randomOffset = Math.floor(Math.random() * totalCount);
    const tagResults: Array<MapsetTags> = await query(
        `SELECT * FROM mapset_tags
            WHERE audio_filename IS NOT NULL
            AND mapset_id NOT IN (${excludedIds.length ? excludedIds.map(() => "?").join(",") : "0"})
            LIMIT 1 OFFSET ?;`,
        [...excludedIds, randomOffset]
    );

    if (!tagResults.length) {
        return null;
    }

    const tags = tagResults[0];

    const mapsetResults: Array<MapsetData> = await query(`SELECT * FROM mapset_data WHERE mapset_id = ?`, [tags.mapset_id]);

    let mapset: MapsetData;

    if (mapsetResults.length > 0) {
        mapset = mapsetResults[0];
    } else {
        const data = await getMapsetById(tags.mapset_id);
        if (!data) {
            return null;
        }

        mapset = data;
        await query(
            `INSERT INTO mapset_data (mapset_id, title, artist, mapper)
             VALUES (?, ?, ?, ?)`,
            [mapset.mapset_id, mapset.title, mapset.artist, mapset.mapper]
        );
    }

    return { ...tags, ...mapset };
}

export async function getRandomBackgroundAction(sessionId?: string) {
    return authenticatedAction(async () => {
        const background = await getRandomBackground(sessionId);
        if (!background) {
            throw new Error("No background found");
        }

        const backgroundImageData = await getCachedMediaFile("backgrounds", background.image_filename);

        return {
            data: background,
            backgroundData: backgroundImageData,
        };
    });
}

async function getRandomBackground(sessionId?: string): Promise<MapsetDataWithTags | null> {
    let excludedIds: number[] = [];
    if (sessionId) {
        const cacheKey = `session_items:${sessionId}:mapset`;
        const cachedRaw = await redisClient.sMembers(cacheKey);
        const cached = Array.isArray(cachedRaw) ? cachedRaw : [];
        if (cached.length > 0) {
            excludedIds = cached.map((id) => Number(id)).filter(Boolean);
        }
    }

    // Get total count first for efficient random selection
    const countResults: Array<{ count: number }> = await query(
        `SELECT COUNT(*) as count FROM mapset_tags
            WHERE mapset_id IS NOT NULL
            AND mapset_id NOT IN (${excludedIds.length ? excludedIds.map(() => "?").join(",") : "0"})`,
        excludedIds
    );

    const totalCount = countResults[0]?.count || 0;
    if (totalCount === 0) {
        return null;
    }

    // Use random offset instead of ORDER BY RAND() for better performance
    const randomOffset = Math.floor(Math.random() * totalCount);
    const tagResults: Array<MapsetTags> = await query(
        `SELECT * FROM mapset_tags
            WHERE mapset_id IS NOT NULL
            AND mapset_id NOT IN (${excludedIds.length ? excludedIds.map(() => "?").join(",") : "0"})
            LIMIT 1 OFFSET ?;`,
        [...excludedIds, randomOffset]
    );

    if (!tagResults.length) {
        return null;
    }

    const tags = tagResults[0];

    const mapsetResults: Array<MapsetData> = await query(`SELECT * FROM mapset_data WHERE mapset_id = ?`, [tags.mapset_id]);
    let mapset: MapsetData;

    if (mapsetResults.length > 0) {
        mapset = mapsetResults[0];
    } else {
        const data = await getMapsetById(tags.mapset_id);
        if (!data) {
            return null;
        }

        mapset = data;
        await query(`INSERT INTO mapset_data (mapset_id, title, artist, mapper) VALUES (?, ?, ?, ?)`, [mapset.mapset_id, mapset.title, mapset.artist, mapset.mapper]);
    }

    return { ...tags, ...mapset };
}

async function getMapsetById(mapsetId: number): Promise<MapsetData | null> {
    const res = await fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.OSU_API_KEY}&s=${mapsetId}`);

    if (!res.ok) {
        return null;
    }

    const data = (await res.json())[0];
    return { mapset_id: data.beatmapset_id, title: data.title, artist: data.artist, mapper: data.creator };
}

export async function getRandomSkinAction(sessionId?: string) {
    return authenticatedAction(async () => {
        const skin = await getRandomSkin(sessionId);
        if (!skin) {
            throw new Error("No skin found");
        }

        const skinData = await getCachedMediaFile("skins", skin.image_filename);

        return {
            data: skin,
            skinData,
        };
    });
}

async function getRandomSkin(sessionId?: string): Promise<SkinData | null> {
    let excludedIds: number[] = [];
    if (sessionId) {
        const cacheKey = `session_items:${sessionId}:skin`;
        const cachedRaw = await redisClient.sMembers(cacheKey);
        const cached = Array.isArray(cachedRaw) ? cachedRaw : [];
        if (cached.length > 0) {
            excludedIds = cached.map((id) => Number(id)).filter(Boolean);
        }
    }
    const condition = excludedIds.length > 0 ? `WHERE id NOT IN (${excludedIds.map(() => "?").join(",")})` : "";
    const params = excludedIds;

    // Get total count first for efficient random selection
    const countResults = (await query(`SELECT COUNT(*) as count FROM skins ${condition}`, params)) as Array<{ count: number }>;

    const totalCount = countResults[0]?.count || 0;
    if (totalCount === 0) {
        return null;
    }

    // Use random offset instead of ORDER BY RAND() for better performance
    const randomOffset = Math.floor(Math.random() * totalCount);
    const result = await query(`SELECT * FROM skins ${condition} LIMIT 1 OFFSET ?`, [...params, randomOffset]);

    return result.length > 0 ? (result[0] as SkinData) : null;
}
