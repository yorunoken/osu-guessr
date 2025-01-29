"use server";

import { query } from "@/lib/database";
import { authenticatedAction } from "./server";
import path from "path";
import fs from "fs/promises";

interface MapsetTags {
    mapset_id: number;
    image_filename: string;
}

interface MapsetData {
    mapset_id: number;
    title: string;
    artist: string;
    mapper: string;
}

export interface MapsetDataWithTags extends MapsetData, MapsetTags {}

export async function getRandomBackgroundAction(previousMapsetId?: number) {
    return authenticatedAction(async () => {
        const background = await getRandomBackground(previousMapsetId);
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

async function getRandomBackground(previousMapsetId?: number): Promise<MapsetDataWithTags | null> {
    const tagResults: Array<MapsetTags> = await query(`SELECT * FROM mapset_tags WHERE mapset_id NOT LIKE ? ORDER BY RAND() LIMIT 1;`, [previousMapsetId ?? 0]);
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
