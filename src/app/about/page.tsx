import { Metadata } from "next";
import AboutClient from "./client";

export const metadata: Metadata = {
    title: "About | osu!guessr",
    description: "Learn more about osu!guessr, how to play, and game mechanics.",
};

export default function AboutPage() {
    return <AboutClient />;
}
