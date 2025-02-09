"use server";

import { addMapset } from "./mapsets";

export async function processBulkMapsets(fileContent: string) {
    const mapsetIds = fileContent
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const match = line.match(/beatmapsets\/(\d+)/);
            return match ? parseInt(match[1]) : null;
        })
        .filter((id): id is number => id !== null);

    console.log(mapsetIds);

    const total = mapsetIds.length;
    const results: Array<{ id: number; success: boolean; error?: string }> = [];

    console.log(`Found ${total} mapsets to process.`);

    for (let i = 0; i < mapsetIds.length; i++) {
        const mapsetId = mapsetIds[i];
        const progress = (((i + 1) / total) * 100).toFixed(1);

        console.log(`[${progress}%] Processing mapset ${mapsetId} (${i + 1}/${total})`);

        try {
            await addMapset(mapsetId);
            results.push({ id: mapsetId, success: true });
            console.log(`✓ Mapset ${mapsetId}: Successfully added`);
        } catch (error) {
            results.push({ id: mapsetId, success: false, error: String(error) });
            console.log(`✗ Mapset ${mapsetId}: Failed - ${error}`);
        }
    }

    return {
        total,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
    };
}
