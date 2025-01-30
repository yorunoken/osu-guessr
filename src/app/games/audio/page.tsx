import { auth } from "@/lib/auth";
import SignInPrompt from "../shared/SignInPrompt";
import PreGameMenu from "./pages/PreGameMenu";
import GameScreen from "./pages/GameScreen";
import MenuManager from "../shared/MenuManager";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Audio Guessr | osu!guessr",
    description: "Challenge yourself by identifying songs from short audio clips.",
};

export default async function AudioGuessr() {
    const session = await auth();

    if (!session?.user?.banchoId) {
        return <SignInPrompt />;
    }
    return <MenuManager PreGameMenu={PreGameMenu} GameScreen={GameScreen} />;
}
