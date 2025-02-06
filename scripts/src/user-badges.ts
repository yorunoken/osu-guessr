import { query } from "../query";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const PRESET_BADGES: Record<string, string> = {
    developer: "#FF0000",
    "beta tester": "#7C3AED",
    translator: "#670067",
    contributor: "#00FF00",
    supporter: "#FF69B4",
    moderator: "#0000FF",
    admin: "#FFD700",
};

async function addBadge(banchoId: number, badge: string, color?: string) {
    const finalColor = badge.toLowerCase() in PRESET_BADGES ? color || PRESET_BADGES[badge.toLowerCase()] : color;

    if (!finalColor) {
        throw Error("Please either type in a color hex code, or select a badge title from the presets.");
    }

    try {
        await query(
            `
            UPDATE users
            SET special_badge = ?,
                special_badge_color = ?
            WHERE bancho_id = ?
            `,
            [badge, finalColor, banchoId],
        );
        console.log(`Successfully added badge "${badge}" to user ${banchoId}`);
    } catch (error) {
        console.error(`Error adding badge to user ${banchoId}:`, error);
    }
}

async function removeBadge(banchoId: number) {
    try {
        await query(
            `
            UPDATE users
            SET special_badge = NULL,
                special_badge_color = NULL
            WHERE bancho_id = ?
            `,
            [banchoId],
        );
        console.log(`Successfully removed badge from user ${banchoId}`);
    } catch (error) {
        console.error(`Error removing badge from user ${banchoId}:`, error);
    }
}

async function listBadges() {
    try {
        const users = await query(
            `
            SELECT bancho_id, username, special_badge, special_badge_color
            FROM users
            WHERE special_badge IS NOT NULL
            `,
        );
        console.table(users);
    } catch (error) {
        console.error("Error listing badges:", error);
    }
}

void yargs(hideBin(process.argv))
    .command(
        "add <banchoId> <badge> <color>",
        "Add a badge to a user",
        (yargs) => {
            return yargs
                .positional("banchoId", {
                    type: "number",
                    describe: "The user's bancho ID",
                    demandOption: true,
                })
                .positional("badge", {
                    type: "string",
                    describe: `The badge text (Available presets: ${Object.keys(PRESET_BADGES).join(", ")})`,
                    demandOption: true,
                })
                .positional("color", {
                    type: "string",
                    describe: "The badge color (hex code or 'default' to use preset color)",
                    demandOption: false,
                });
        },
        (argv) => {
            if (argv.banchoId && argv.badge) {
                addBadge(argv.banchoId, argv.badge, argv.color);
            } else {
                console.error("Missing required arguments");
            }
        },
    )
    .command(
        "remove <banchoId>",
        "Remove a badge from a user",
        (yargs) => {
            return yargs.positional("banchoId", {
                type: "number",
                describe: "The user's bancho ID",
                demandOption: true,
            });
        },
        (argv) => {
            if (argv.banchoId) {
                removeBadge(argv.banchoId);
            } else {
                console.error("Missing bancho ID");
            }
        },
    )
    .command(
        "list",
        "List all users with badges",
        () => {},
        () => {
            listBadges();
        },
    )
    .demandCommand(1)
    .help().argv;
