import { readFileSync } from "fs";

/* eslint-disable  @typescript-eslint/no-explicit-any */
function getAllKeys(obj: any, prefix: string = ""): string[] {
    let keys: string[] = [];

    for (const key in obj) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
            keys = [...keys, ...getAllKeys(obj[key], newPrefix)];
        } else {
            keys.push(newPrefix);
        }
    }

    return keys;
}

function findMissingKeys(enKeys: string[], csKeys: string[]): string[] {
    return enKeys.filter((key) => !csKeys.includes(key));
}

const languageCode = process.argv[2];

if (!languageCode) {
    console.error("❌ Please provide a language code, e.g.: bun run check-translations.ts cs");
    process.exit(1);
}

try {
    const enJson = JSON.parse(readFileSync("./src/messages/en.json", "utf8"));
    const targetJson = JSON.parse(readFileSync(`./src/messages/${languageCode}.json`, "utf8"));

    const enKeys = getAllKeys(enJson);
    const targetKeys = getAllKeys(targetJson);

    const missingKeys = findMissingKeys(enKeys, targetKeys);

    if (missingKeys.length === 0) {
        console.log(`✅ All English keys are present in the ${languageCode} translation`);
    } else {
        console.log(`❌ Missing translations for ${languageCode}:`);
        missingKeys.forEach((key) => console.log(`  - ${key}`));
        console.log(`\nTotal missing keys: ${missingKeys.length}`);
    }
} catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        console.error(`❌ Translation file not found: ./src/messages/${languageCode}.json`);
    } else {
        console.error("Error processing files:", error);
    }

    process.exit(1);
}
