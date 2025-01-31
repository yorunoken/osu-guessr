import { query } from "@/lib/database";

interface SpecialUser {
    banchoId: number;
    badge: string;
    color: string;
}

export const SPECIAL_USERS: Array<SpecialUser> = [
    { banchoId: 17279598, badge: "Owner", color: "#FF6B6B" },
    { banchoId: 13845312, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 20367144, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 25468052, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 18567756, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 18153277, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 14519821, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 12643934, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 4539930, badge: "Fish", color: "#DE9B4A" },
    { banchoId: 3171691, badge: "Baguette", color: "#292c3d" },
];

export async function updateSpecialUsers() {
    try {
        // Start a transaction
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
}

updateSpecialUsers();
