"use server";

import { query } from "@/lib/database";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import unzipper from "unzipper";
import sharp from "sharp";

const DIRECTORIES = {
    audio: path.join(process.cwd(), "mapsets", "audio"),
    backgrounds: path.join(process.cwd(), "mapsets", "backgrounds"),
    temp: path.join(process.cwd(), "tmp"),
} as const;

const OSU_API_KEY = process.env.OSU_API_KEY;
const BEATCONNECT_BASE_URL = "https://beatconnect.io/b";
const OSU_COVERS_BASE_URL = "https://assets.ppy.sh/beatmaps";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/get_beatmaps";

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

interface OsuApiResponse {
    title: string;
    artist: string;
    creator: string;
}

async function ensureDirectories(): Promise<void> {
    const directories = Object.values(DIRECTORIES);
    await Promise.all(directories.map((dir) => fs.mkdir(dir, { recursive: true })));
}

async function cleanupDirectory(dirPath: string): Promise<void> {
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
        console.warn(`Failed to cleanup directory ${dirPath}:`, error);
    }
}

async function getBeatmapData(mapsetId: number): Promise<BeatmapData | null> {
    if (!OSU_API_KEY) {
        throw new Error("OSU_API_KEY environment variable is not set");
    }

    try {
        const url = `${OSU_API_BASE_URL}?k=${OSU_API_KEY}&s=${mapsetId}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = (await response.json()) as OsuApiResponse[];

        if (!data || data.length === 0) {
            return null;
        }

        return {
            title: data[0].title,
            artist: data[0].artist,
            creator: data[0].creator,
        };
    } catch (error) {
        console.error(`Failed to fetch beatmap data for ${mapsetId}:`, error);
        return null;
    }
}

async function downloadMapset(mapsetId: number): Promise<string | null> {
    const mapsetDir = path.join(DIRECTORIES.temp, mapsetId.toString());
    await fs.mkdir(mapsetDir, { recursive: true });

    try {
        const oszUrl = `${BEATCONNECT_BASE_URL}/${mapsetId}`;
        const response = await fetch(oszUrl);

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }

        const oszPath = path.join(mapsetDir, `${mapsetId}.osz`);

        if (response.body) {
            // @ts-expect-error idk
            await pipeline(response.body, fsSync.createWriteStream(oszPath));
        } else {
            throw new Error("No response body");
        }

        const stats = await fs.stat(oszPath);
        if (stats.size === 0) {
            throw new Error("Downloaded file is empty");
        }

        await new Promise<void>((resolve, reject) => {
            fsSync
                .createReadStream(oszPath)
                .pipe(unzipper.Extract({ path: mapsetDir }))
                .on("close", resolve)
                .on("error", reject);
        });

        await fs.unlink(oszPath).catch(() => {});

        return mapsetDir;
    } catch (error) {
        console.error(`Error downloading mapset ${mapsetId}:`, error);
        await cleanupDirectory(mapsetDir);
        return null;
    }
}

async function downloadBackground(mapsetId: number): Promise<string | null> {
    try {
        const imageFilename = `${mapsetId}.webp`;
        const destPath = path.join(DIRECTORIES.backgrounds, imageFilename);

        const imageUrl = `${OSU_COVERS_BASE_URL}/${mapsetId}/covers/fullsize.jpg`;
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        // Process and compress the image
        await sharp(buffer)
            .resize({
                width: 1920,
                height: 1080,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toFile(destPath);

        return imageFilename;
    } catch (error) {
        console.error(`Error downloading background for mapset ${mapsetId}:`, error);
        return null;
    }
}

// Audio Processing
async function findLargestAudioFile(mapsetDir: string): Promise<string | null> {
    try {
        const files = await fs.readdir(mapsetDir);
        const audioExtensions = [".mp3", ".ogg", ".wav"];

        let largestAudio: string | null = null;
        let largestSize = 0;

        for (const file of files) {
            const hasAudioExtension = audioExtensions.some((ext) => file.toLowerCase().endsWith(ext));

            if (hasAudioExtension) {
                const filePath = path.join(mapsetDir, file);
                const stats = await fs.stat(filePath);

                if (stats.size > largestSize) {
                    largestSize = stats.size;
                    largestAudio = file;
                }
            }
        }

        return largestAudio;
    } catch (error) {
        console.error("Error finding audio files:", error);
        return null;
    }
}

async function processAudio(mapsetId: number, mapsetDir: string): Promise<string | null> {
    try {
        const largestAudio = await findLargestAudioFile(mapsetDir);
        if (!largestAudio) {
            throw new Error("No audio files found");
        }

        const srcPath = path.join(mapsetDir, largestAudio);
        const audioFilename = `${mapsetId}.mp3`;
        const destPath = path.join(DIRECTORIES.audio, audioFilename);

        // For now, just copy the file - you can add ffmpeg processing later
        await fs.copyFile(srcPath, destPath);

        return audioFilename;
    } catch (error) {
        console.error(`Error processing audio for mapset ${mapsetId}:`, error);
        return null;
    }
}

async function saveMapsetToDatabase(mapsetId: number, beatmapData: BeatmapData, imageFilename: string, audioFilename: string): Promise<void> {
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
}

async function removeMapsetFromDatabase(mapsetId: number): Promise<void> {
    await query("DELETE FROM mapset_tags WHERE mapset_id = ?", [mapsetId]);
    await query("DELETE FROM mapset_data WHERE mapset_id = ?", [mapsetId]);
}

export async function addMapset(mapsetId: number): Promise<void> {
    console.log(`Processing mapset ID: ${mapsetId}`);

    try {
        await ensureDirectories();

        const beatmapData = await getBeatmapData(mapsetId);
        if (!beatmapData) {
            throw new Error("Could not fetch beatmap data from osu! API");
        }

        const mapsetDir = await downloadMapset(mapsetId);
        if (!mapsetDir) {
            throw new Error("Failed to download and extract mapset");
        }

        const [audioFilename, imageFilename] = await Promise.all([processAudio(mapsetId, mapsetDir), downloadBackground(mapsetId)]);

        if (!audioFilename) {
            throw new Error("Failed to process audio file");
        }

        if (!imageFilename) {
            throw new Error("Failed to download background image");
        }

        await saveMapsetToDatabase(mapsetId, beatmapData, imageFilename, audioFilename);

        await cleanupDirectory(mapsetDir);

        console.log(`Successfully added mapset ${mapsetId}`);
    } catch (error) {
        console.error(`Error adding mapset ${mapsetId}:`, error);
        throw error;
    }
}

export async function removeMapset(mapsetId: number): Promise<void> {
    try {
        const files = (await query("SELECT image_filename, audio_filename FROM mapset_tags WHERE mapset_id = ?", [mapsetId])) as Array<{ image_filename?: string; audio_filename?: string }>;

        if (files.length > 0 && files[0]) {
            const { image_filename, audio_filename } = files[0];

            const fileRemovalPromises = [];

            if (image_filename) {
                const imagePath = path.join(DIRECTORIES.backgrounds, image_filename);
                fileRemovalPromises.push(fs.unlink(imagePath).catch(() => console.warn(`Background file ${image_filename} not found`)));
            }

            if (audio_filename) {
                const audioPath = path.join(DIRECTORIES.audio, audio_filename);
                fileRemovalPromises.push(fs.unlink(audioPath).catch(() => console.warn(`Audio file ${audio_filename} not found`)));
            }

            await Promise.all(fileRemovalPromises);
        }

        await removeMapsetFromDatabase(mapsetId);

        console.log(`Successfully removed mapset ${mapsetId}`);
    } catch (error) {
        console.error(`Error removing mapset ${mapsetId}:`, error);
        throw error;
    }
}

export async function listMapsets(): Promise<Mapset[]> {
    try {
        const mapsets = await query(`
      SELECT
        md.mapset_id,
        md.title,
        md.artist,
        md.mapper,
        mt.image_filename,
        mt.audio_filename
      FROM mapset_data md
      JOIN mapset_tags mt ON md.mapset_id = mt.mapset_id
      ORDER BY md.mapset_id DESC
    `);

        return mapsets as Mapset[];
    } catch (error) {
        console.error("Error listing mapsets:", error);
        return [];
    }
}
