import { auth } from "@/lib/auth";

import { OWNER_ID } from "@/lib";
import NotFound from "../not-found";
import AdminMenu from "./menu";

export default async function AdminPage() {
    const session = await auth();

    if (session?.user?.banchoId !== OWNER_ID) {
        return <NotFound />;
    }

    return <AdminMenu />;
}
