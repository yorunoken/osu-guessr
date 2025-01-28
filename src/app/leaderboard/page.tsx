import { Metadata } from "next";
import LeaderboardClient from "./client";

export const metadata: Metadata = {
    title: "Leaderboard | osu!guessr",
    description: "View the top players and their scores across different game modes.",
};

export default function LeaderboardPage() {
    return <LeaderboardClient />;
}
