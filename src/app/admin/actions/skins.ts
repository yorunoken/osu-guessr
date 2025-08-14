"use server";

import { query } from "@/lib/database";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const DIRECTORIES = {
    skins: path.join(process.cwd(), "mapsets", "skins"),
    temp: path.join(process.cwd(), "tmp"),
} as const;

const OSUCK_API_KEY = process.env.OSUCK_API_KEY;
const OSUCK_API_BASE_URL = "https://osuck.link/api/skins/random";

interface SkinData {
    _nsfw: boolean;
    id: number;
    name: string;
    gamemodes: number[];
    screenshots: Array<{
        // 2 = song select
        // 6 = gameplay
        // 10 = pause screen
        // 12 = result screen
        category: number;
        gamemode: number;
        large: string;
        medium: string;
        small: string;
    }>;
    link_to_skin: string;
}

interface ApiResponse {
    status: "success" | "failed";
    message: "rate limited" | "no api key" | "invalid api key" | SkinData;
}

interface SkinProcessResult {
    success: boolean;
    skinId?: number;
    image?: string;
    error?: string;
}

interface DatabaseSkin {
    id: number;
    name: string;
    image_filename: string;
    created_at: string;
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

async function fetchSkinMetadata(skinId: number): Promise<SkinData | null> {
    if (!OSUCK_API_KEY) {
        throw new Error("OSUCK_API_KEY environment variable is not set");
    }

    try {
        const url = `${OSUCK_API_BASE_URL}?key=${OSUCK_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ skins: [skinId] }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse;

        if (data.status === "failed") {
            const errorMessage = typeof data.message === "string" ? data.message : "Unknown API error";
            throw new Error(`API error: ${errorMessage}`);
        }

        const msg = data.message as SkinData;
        return msg;
    } catch (error) {
        console.error(`Failed to fetch skin metadata for ${skinId} :`, error);
        return null;
    }
}

async function downloadSkin(skinData: SkinData): Promise<string | null> {
    const gameplayCategory = skinData.screenshots.find((screenshot) => screenshot.category === 6); // 6 is for the gameplay category of the skin
    if (!gameplayCategory) {
        throw new Error("No gameplay screenshot found for this skin");
    }

    const fileName = `${skinData.id}.webp`;
    const imagePath = path.join(DIRECTORIES.skins, fileName);

    try {
        const response = await fetch(gameplayCategory.large);

        if (!response.ok) {
            throw new Error(`Failed to download screenshot: ${response.status}`);
        }

        if (!response.body) {
            throw new Error("No response body for screenshot download");
        }

        // @ts-expect-error idk why
        const nodeStream = Readable.fromWeb(response.body);
        await pipeline(nodeStream, fsSync.createWriteStream(imagePath));

        return fileName;
    } catch (error) {
        console.error(`Error downloading screenshot for skin ${skinData.id}:`, error);
        return null;
    }
}

async function saveSkinToDatabase(skinData: SkinData, imageFilename: string): Promise<void> {
    await query(
        `INSERT INTO skins (id, name, image_filename)
     VALUES (?, ?, ?)`,
        [skinData.id, skinData.name, imageFilename]
    );
}

async function removeSkinFromDatabase(id: number): Promise<void> {
    await query("DELETE FROM skins WHERE id = ?", [id]);
}

export async function addSkinById(skinId: number): Promise<SkinProcessResult> {
    console.log(`Processing skin ID: ${skinId}`);

    try {
        await ensureDirectories();
        const skinData = await fetchSkinMetadata(skinId);
        if (!skinData) {
            throw new Error("Could not fetch skin metadata from API");
        }

        const skinFileName = await downloadSkin(skinData);
        if (!skinFileName) {
            throw new Error("Failed to download and extract skin");
        }

        await saveSkinToDatabase(skinData, skinFileName);

        await cleanupDirectory(skinFileName);

        return {
            success: true,
            skinId: skinData.id,
            image: skinFileName,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error adding skin ${skinId}:`, errorMessage);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function addSkinsFromList(ids: number[]): Promise<Array<{ id: number; success: boolean; error?: string; image?: string }>> {
    const results: Array<{ id: number; success: boolean; error?: string; image?: string }> = [];

    for (const [index, id] of ids.entries()) {
        console.log(`Processing skin ${index + 1}/${ids.length}: ${id}`);

        try {
            const skinData = await fetchSkinMetadata(id);
            if (!skinData) {
                throw new Error("Could not fetch skin metadata from API");
            }

            const image = await downloadSkin(skinData);
            if (!image) {
                throw new Error("Failed to download image");
            }

            await saveSkinToDatabase(skinData, image);

            results.push({ id, success: true, image });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            results.push({ id, success: false, error: errorMessage });
        }

        // small delay between downloads to be polite to ck :)
        if (index < ids.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    const successful = results.filter((r) => r.success).length;
    console.log(`Successfully processed ${successful}/${ids.length} skins`);

    return results;
}

export async function listSkins(): Promise<DatabaseSkin[]> {
    try {
        const skins = await query(`
      SELECT * FROM skins 
      ORDER BY created_at DESC
    `);

        return skins as DatabaseSkin[];
    } catch (error) {
        console.error("Error listing skins:", error);
        return [];
    }
}

export async function removeSkin(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        const rows = (await query("SELECT image_filename FROM skins WHERE id = ?", [id])) as Array<{ image_filename?: string }>;

        if (rows.length > 0 && rows[0]?.image_filename) {
            const imagePath = path.join(DIRECTORIES.skins, rows[0].image_filename);
            await fs.unlink(imagePath).catch(() => console.warn(`Image file ${rows[0].image_filename} not found`));
        }

        await removeSkinFromDatabase(id);

        console.log(`Successfully removed skin ${id}`);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error removing skin ${id}:`, errorMessage);

        return {
            success: false,
            error: errorMessage,
        };
    }
}
