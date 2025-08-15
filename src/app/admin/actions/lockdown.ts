"use server";

import { getAuthSession } from "@/actions/server";
import { OWNER_ID } from "@/lib";
import { setLock, unlock, getLockInfo } from "@/lib/lockdown";

export async function adminSetLock(minutes: number) {
    const session = await getAuthSession();
    const info = await setLock(minutes, session.user.banchoId);
    return info;
}

export async function adminUnlock() {
    const session = await getAuthSession();
    if (session.user.banchoId === OWNER_ID) {
        await unlock();
        return { success: true };
    }
    return { success: false };
}

export async function adminGetLock() {
    const session = await getAuthSession();
    console.log(session.user.banchoId, OWNER_ID);
    if (session.user.banchoId === OWNER_ID) {
        const info = await getLockInfo();
        console.log(info);
        return info;
    }
    return null;
}
