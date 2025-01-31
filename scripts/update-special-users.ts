import { query } from "@/lib/database";
import { getSpecialUsers } from "@/actions/user-server";

const SPECIAL_USERS = await getSpecialUsers();

try {
    await query("START TRANSACTION");

    await query(`
            UPDATE users
            SET special_badge = NULL,
                special_badge_color = NULL
        `);

    for (const user of SPECIAL_USERS) {
        await query(
            `
                UPDATE users
                SET special_badge = ?,
                    special_badge_color = ?
                WHERE bancho_id = ?
            `,
            [user.badge, user.color, user.banchoId],
        );
    }

    await query("COMMIT");

    console.log("Successfully updated special users");
} catch (error) {
    await query("ROLLBACK");
    console.error("Error updating special users:", error);
}
