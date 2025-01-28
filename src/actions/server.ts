"use server";

import { auth } from "@/lib/auth";
import { Session } from "next-auth";

export async function authenticatedAction<T>(action: (session: Session) => Promise<T>): Promise<T> {
    const session = await auth();
    if (!session?.user?.banchoId) {
        throw new Error("Unauthorized");
    }
    return action(session);
}

export async function getAuthSession(): Promise<Session> {
    const session = await auth();
    if (!session?.user?.banchoId) {
        throw new Error("Unauthorized");
    }

    return session;
}
