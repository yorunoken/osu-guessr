"use server";

import { query } from "@/lib/database";
import { authenticatedAction } from "./server";
import path from "path";
import fs from "fs/promises";

import type { MapsetTags, MapsetData, MapsetDataWithTags, SkinData } from "./types";

export async function getRandomAudioAction(sessionId?: string) {
    return authenticatedAction(async () => {
        const audio = await getRandomAudio(sessionId);
        if (!audio) {
            throw new Error("No audio found");
        }

        const audioPath = path.join(process.cwd(), "mapsets", "audio", audio.audio_filename);
        const audioBuffer = await fs.readFile(audioPath);

        const fileExtension = path.extname(audio.audio_filename).toLowerCase();
        const mimeType = fileExtension === ".ogg" ? "audio/ogg" : "audio/mp3";

        const audioData = `data:${mimeType};base64,${audioBuffer.toString("base64")}`;

        return {
            data: audio,
            audioData,
        };
    });
}

async function getRandomAudio(sessionId?: string): Promise<MapsetDataWithTags | null> {
    const usedMapsets: Array<{ item_id: number }> = sessionId ? await query(`SELECT item_id FROM session_items WHERE session_id = ? AND item_type = 'mapset'`, [sessionId]) : [];

    const excludedIds = [...usedMapsets.map((m) => m.item_id)].filter(Boolean);

    const tagResults: Array<MapsetTags> = await query(
        `SELECT * FROM mapset_tags
            WHERE audio_filename IS NOT NULL
            AND mapset_id NOT IN (${excludedIds.length ? "?".repeat(excludedIds.length).split("").join(",") : "0"})
            ORDER BY RAND() LIMIT 1;`,
        excludedIds
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

        const imagePath = path.join(process.cwd(), "mapsets", "backgrounds", background.image_filename);
        const imageBuffer = await fs.readFile(imagePath);
        const backgroundImageData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

        return {
            data: background,
            backgroundData: backgroundImageData,
        };
    });
}

async function getRandomBackground(sessionId?: string): Promise<MapsetDataWithTags | null> {
    const usedMapsets: Array<{ item_id: number }> = sessionId ? await query(`SELECT item_id FROM session_items WHERE session_id = ? AND item_type = 'mapset'`, [sessionId]) : [];

    const excludedIds = [...usedMapsets.map((m) => m.item_id)].filter(Boolean);

    const tagResults: Array<MapsetTags> = await query(
        `SELECT * FROM mapset_tags
            WHERE mapset_id IS NOT NULL
            AND mapset_id NOT IN (${excludedIds.length ? "?".repeat(excludedIds.length).split("").join(",") : "0"})
            ORDER BY RAND() LIMIT 1;`,
        excludedIds
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

        const imagePath = path.join(process.cwd(), "mapsets", "skins", skin.image_filename);
        const imageBuffer = await fs.readFile(imagePath);
        const skinData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

        return {
            data: skin,
            skinData,
        };
    });
}

async function getRandomSkin(sessionId?: string): Promise<SkinData | null> {
    const condition = sessionId ? `AND s.id NOT IN (SELECT item_id FROM session_items WHERE session_id = ? AND item_type = 'skin')` : "";

    const params = sessionId ? [sessionId] : [];

    const result = await query(
        `SELECT s.* 
         FROM skins s 
         WHERE s.is_active = TRUE ${condition}
         ORDER BY RAND() 
         LIMIT 1`,
        params
    );

    return result.length > 0 ? (result[0] as SkinData) : null;
}
