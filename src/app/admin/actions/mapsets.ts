"use server";

import { query } from "@/lib/database";

import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

const AUDIO_DIR = path.join(process.cwd(), "mapsets", "audio");
const BG_DIR = path.join(process.cwd(), "mapsets", "backgrounds");
const TEMP_DIR = path.join(process.cwd(), "tmp");

const OSU_API_KEY = process.env.OSU_API_KEY;

export interface Mapset {
    mapset_id: number;
    title: string;
    artist: string;
    mapper: string;
    image_filename: string;
    audio_filename: string;
}

interface BeatmapData {
    title: string;
    artist: string;
    creator: string;
}

async function ensureDirectories() {
    await fs.mkdir(AUDIO_DIR, { recursive: true });
    await fs.mkdir(BG_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
}

async function getBeatmapData(mapsetId: number): Promise<BeatmapData | null> {
    if (!OSU_API_KEY) {
        throw new Error("OSU_API_KEY environment variable is not set");
    }

    const response = await fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${OSU_API_KEY}&s=${mapsetId}`);
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const data = (await response.json()) as any[];

    if (!data || data.length === 0) {
        return null;
    }

    return {
        title: data[0].title,
        artist: data[0].artist,
        creator: data[0].creator,
    };
}

async function downloadMapset(mapsetId: number): Promise<boolean> {
    const mapsetDir = path.join(TEMP_DIR, mapsetId.toString());
    await fs.mkdir(mapsetDir, { recursive: true });

    try {
        // Download beatmap
        execSync(`wget -q "https://beatconnect.io/b/${mapsetId}" -O "${mapsetDir}/${mapsetId}.osz"`, { stdio: "inherit" });

        // Check if file exists and is not empty
        const stats = await fs.stat(`${mapsetDir}/${mapsetId}.osz`);
        if (stats.size === 0) {
            throw new Error("Downloaded file is empty");
        }

        // Unzip beatmap
        execSync(`unzip -q "${mapsetDir}/${mapsetId}.osz" -d "${mapsetDir}"`, {
            stdio: "inherit",
        });

        return true;
    } catch (error) {
        console.error(`Error downloading/extracting mapset ${mapsetId}:`, error);
        return false;
    }
}

async function processAudio(mapsetId: number, mapsetDir: string): Promise<string | null> {
    try {
        const files = await fs.readdir(mapsetDir);
        let largestAudio = null;
        let largestSize = 0;

        for (const file of files) {
            if (file.endsWith(".mp3") || file.endsWith(".ogg")) {
                const stats = await fs.stat(path.join(mapsetDir, file));
                if (stats.size > largestSize) {
                    largestSize = stats.size;
                    largestAudio = file;
                }
            }
        }

        if (!largestAudio) {
            return null;
        }

        const ext = path.extname(largestAudio);
        const audioFilename = `${mapsetId}${ext}`;
        await fs.copyFile(path.join(mapsetDir, largestAudio), path.join(AUDIO_DIR, audioFilename));

        return audioFilename;
    } catch (error) {
        console.error(`Error processing audio for mapset ${mapsetId}:`, error);
        return null;
    }
}

async function downloadBackground(mapsetId: number): Promise<string | null> {
    try {
        const imageFilename = `${mapsetId}.jpg`;
        execSync(`wget -q "https://assets.ppy.sh/beatmaps/${mapsetId}/covers/fullsize.jpg" -O "${path.join(BG_DIR, imageFilename)}"`, { stdio: "inherit" });
        return imageFilename;
    } catch (error) {
        console.error(`Error downloading background for mapset ${mapsetId}:`, error);
        return null;
    }
}

export async function addMapset(mapsetId: number) {
    try {
        await ensureDirectories();

        console.log(`Processing mapset ID: ${mapsetId}`);

        const beatmapData = await getBeatmapData(mapsetId);
        if (!beatmapData) {
            throw new Error("Could not fetch beatmap data");
        }

        const success = await downloadMapset(mapsetId);
        if (!success) {
            throw new Error("Failed to download mapset");
        }

        const mapsetDir = path.join(TEMP_DIR, mapsetId.toString());
        const audioFilename = await processAudio(mapsetId, mapsetDir);
        if (!audioFilename) {
            throw new Error("Failed to process audio");
        }

        const imageFilename = await downloadBackground(mapsetId);
        if (!imageFilename) {
            throw new Error("Failed to download background");
        }

        await query(
            `INSERT INTO mapset_data (mapset_id, title, artist, mapper)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             artist = VALUES(artist),
             mapper = VALUES(mapper)`,
            [mapsetId, beatmapData.title, beatmapData.artist, beatmapData.creator]
        );

        await query(
            `INSERT INTO mapset_tags (mapset_id, image_filename, audio_filename)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             image_filename = VALUES(image_filename),
             audio_filename = VALUES(audio_filename)`,
            [mapsetId, imageFilename, audioFilename]
        );

        // Cleanup
        await fs.rm(mapsetDir, { recursive: true, force: true });

        console.log(`Successfully added mapset ${mapsetId}`);
    } catch (error) {
        console.error(`Error adding mapset ${mapsetId}:`, error);
    }
}

export async function removeMapset(mapsetId: number) {
    try {
        const files = (await query("SELECT image_filename, audio_filename FROM mapset_tags WHERE mapset_id = ?", [mapsetId])) as [{ image_filename?: string; audio_filename?: string }];

        if (files[0]) {
            if (files[0].image_filename) {
                await fs.unlink(path.join(BG_DIR, files[0].image_filename)).catch(() => console.log(`Background file for mapset ${mapsetId} not found`));
            }
            if (files[0].audio_filename) {
                await fs.unlink(path.join(AUDIO_DIR, files[0].audio_filename)).catch(() => console.log(`Audio file for mapset ${mapsetId} not found`));
            }
        }

        // Remove database entries
        await query("DELETE FROM mapset_tags WHERE mapset_id = ?", [mapsetId]);
        await query("DELETE FROM mapset_data WHERE mapset_id = ?", [mapsetId]);

        console.log(`Successfully removed mapset ${mapsetId}`);
    } catch (error) {
        console.error(`Error removing mapset ${mapsetId}:`, error);
    }
}

export async function listMapsets(): Promise<Mapset[]> {
    try {
        const mapsets = await query(
            `
                SELECT
                    md.mapset_id,
                    md.title,
                    md.artist,
                    md.mapper,
                    mt.image_filename,
                    mt.audio_filename
                FROM mapset_data md
                JOIN mapset_tags mt ON md.mapset_id = mt.mapset_id
            `
        );
        console.table(mapsets);
        return mapsets as Mapset[];
    } catch (error) {
        console.error("Error listing mapsets:", error);
        return [];
    }
}
