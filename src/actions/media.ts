import path from "path";
import fs from "fs/promises";
import { GameMode } from "./types";

export async function getMediaData(gameMode: GameMode, filename: string | null): Promise<string | undefined> {
    if (!filename) return undefined;

    try {
        let filePath: string;
        let mimeType: string;

        if (gameMode === GameMode.Background) {
            filePath = path.join(process.cwd(), "mapsets", "backgrounds", filename);
            mimeType = "image/jpeg";
        } else if (gameMode === GameMode.Audio) {
            filePath = path.join(process.cwd(), "mapsets", "audio", filename);
            const fileExtension = path.extname(filename).toLowerCase();
            mimeType = fileExtension === ".ogg" ? "audio/ogg" : "audio/mp3";
        } else if (gameMode === GameMode.Skin) {
            filePath = path.join(process.cwd(), "mapsets", "skins", filename);
            mimeType = "image/jpeg"; // Depending on how skins are saved, could be png, but assuming jpeg based on existing code
        } else {
            return undefined;
        }

        const buffer = await fs.readFile(filePath);
        return `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch (error) {
        console.error(`Failed to load media for ${gameMode} with filename ${filename}:`, error);
        return undefined;
    }
}
