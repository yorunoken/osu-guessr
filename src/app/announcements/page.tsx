import React from "react";
import { listAnnouncements } from "@/actions/announcements";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    const announcements = await listAnnouncements();

    return (
        <div className="min-h-screen bg-background text-foreground py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Announcements</h1>
                {announcements.length === 0 ? (
                    <p className="text-muted-foreground">No announcements</p>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((a) => (
                            <div key={a.id} className="p-4 bg-card border border-border rounded-md">
                                <h2 className="text-lg font-semibold">{a.title}</h2>
                                <div className="text-xs text-muted-foreground mb-2">{new Date(a.created_at).toLocaleString()}</div>
                                <div className="whitespace-pre-wrap">{a.content}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
