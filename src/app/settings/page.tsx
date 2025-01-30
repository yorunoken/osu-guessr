import { Metadata } from "next";
import { auth } from "@/lib/auth";
import SignInPrompt from "../games/shared/SignInPrompt";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
    title: "Settings | osu!guessr",
    description: "Manage your API keys and account settings",
};

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.banchoId) {
        return <SignInPrompt />;
    }

    return <SettingsClient />;
}
