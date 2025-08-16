import { auth } from "@/lib/auth";

import { OWNER_ID } from "@/lib";
import NotFound from "../../not-found";
import BeatmapsAdmin from "./ui";

export default async function BeatmapsPage() {
    const session = await auth();

    if (session?.user?.banchoId !== OWNER_ID) {
        return <NotFound />;
    }

    return <BeatmapsAdmin />;
}
