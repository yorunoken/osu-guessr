import { auth } from "@/lib/auth";
import SignInPrompt from "../shared/SignInPrompt";
import PreGameMenu from "./pages/PreGameMenu";
import GameScreen from "./pages/GameScreen";
import MenuManager from "../shared/MenuManager";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Skin Guessr | osu!guessr",
    description: "Test your knowledge of osu! skins by identifying them from screenshots.",
};

export default async function SkinGuessr() {
    const session = await auth();

    if (!session?.user?.banchoId) {
        return <SignInPrompt />;
    }
    return <MenuManager PreGameMenu={PreGameMenu} GameScreen={GameScreen} />;
}
