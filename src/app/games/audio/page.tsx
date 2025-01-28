import ComingSoon from "../ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Audio Guessr | osu!guessr",
    description: "Challenge yourself by identifying songs from short audio clips.",
};

export default function AudioGuessr() {
    return <ComingSoon mode="Audio" />;
}
