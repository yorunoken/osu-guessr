import { auth } from "@/lib/auth";
import Controller from "./MenuManager";
import SignInPrompt from "../SignInPrompt";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Background Guessr | osu!guessr",
    description: "Test your knowledge by guessing songs from their beatmap backgrounds.",
};

export default async function BackgroundGuesser() {
    const session = await auth();

    if (!session?.user?.banchoId) {
        return <SignInPrompt />;
    }

    return <Controller />;
}
