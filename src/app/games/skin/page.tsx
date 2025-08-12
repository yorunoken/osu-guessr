import ComingSoon from "../ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Skin Guessr | osu!guessr",
    description: "Test your knowledge of osu! skins by identifying them from screenshots.",
};
export default function SkinGuessr() {
    return <ComingSoon mode="skin" />;
}
