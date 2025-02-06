import { query } from "../query";

async function syncUserAchievements() {
    try {
        await query("START TRANSACTION");

        await query(`
            UPDATE user_achievements
            SET
                total_score = 0,
                games_played = 0,
                highest_streak = 0,
                highest_score = 0
        `);

        const gameStats = await query(`
            SELECT
                user_id,
                game_mode,
                COUNT(*) as games_played,
                MAX(streak) as highest_streak,
                MAX(points) as highest_score,
                SUM(points) as total_score,
                MAX(ended_at) as last_played
            FROM games
            GROUP BY user_id, game_mode
        `);

        await query(`
            INSERT IGNORE INTO user_achievements (user_id, game_mode)
            SELECT DISTINCT g.user_id, g.game_mode
            FROM games g
            LEFT JOIN user_achievements ua
                ON g.user_id = ua.user_id
                AND g.game_mode = ua.game_mode
            WHERE ua.user_id IS NULL
        `);

        for (const stat of gameStats) {
            await query(
                `
                UPDATE user_achievements
                SET
                    games_played = ?,
                    highest_streak = ?,
                    highest_score = ?,
                    total_score = ?,
                    last_played = ?
                WHERE user_id = ?
                AND game_mode = ?
            `,
                [stat.games_played, stat.highest_streak, stat.highest_score, stat.total_score, stat.last_played, stat.user_id, stat.game_mode],
            );
        }

        await query("COMMIT");
        console.log("Successfully synced user achievements with games data");
    } catch (error) {
        await query("ROLLBACK");
        console.error("Error syncing user achievements:", error);
    }
}

syncUserAchievements();
