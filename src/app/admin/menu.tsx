"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { addMapset, removeMapset, listMapsets, Mapset } from "./actions/mapsets";
import { syncUserAchievements } from "./actions/update-outofsync-users";
import { checkTranslation, fillMissingTranslations, removeExtraTranslations, getAllLanguages } from "./actions/check-translations";
import { getBadges, addBadge, removeBadge, assignBadgeToUser, removeBadgeFromUser, listBadges, UserBadge } from "./actions/manage-badges";
import { processBulkMapsets } from "./actions/bulk-mapsets";
import { deploy } from "./actions/deploy";
import { listReports, updateReportStatus } from "./actions/reports";
import { listSkins, removeSkin, addSkinById, addSkinsFromList } from "./actions/skins";

import { CollapsibleSection } from "./ui";

export default function AdminMenu() {
    const consoleDivRef = useRef<HTMLDivElement>(null);

    const [mapsetId, setMapsetId] = useState("");
    const [bulkFile, setBulkFile] = useState<File | null>(null);

    const [badgeUserId, setBadgeUserId] = useState("");
    const [badgeTitle, setBadgeTitle] = useState("");
    const [badgeColor, setBadgeColor] = useState("");
    const [newBadgeName, setNewBadgeName] = useState("");
    const [newBadgeColor, setNewBadgeColor] = useState("#000000");
    const [availableBadges, setAvailableBadges] = useState<Record<string, string>>({});

    const [languageCode, setLanguageCode] = useState("");
    const [autoFill, setAutoFill] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const [removeExtra, setRemoveExtra] = useState(false);

    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [reportId, setReportId] = useState("");
    const [reportStatus, setReportStatus] = useState("pending");
    const [skinRemoveId, setSkinRemoveId] = useState("");
    const [skinSingleId, setSkinSingleId] = useState("");
    const [skinListFile, setSkinListFile] = useState<File | null>(null);

    const appendOutput = (text: string) => {
        setOutput((prev) => prev + "\n" + text);
    };

    const loadAvailableBadges = useCallback(async () => {
        try {
            const badges = (await getBadges()) as Array<{ name: string; color: string }>;
            const badgeMap: Record<string, string> = {};
            badges.forEach((badge: { name: string; color: string }) => {
                badgeMap[badge.name] = badge.color;
            });
            setAvailableBadges(badgeMap);
        } catch (error) {
            appendOutput(`Error loading badges: ${error}`);
        }
    }, []);

    const loadAvailableLanguages = useCallback(async () => {
        const languages = await getAllLanguages();
        setAvailableLanguages(languages);
    }, []);

    useEffect(() => {
        loadAvailableBadges();
        loadAvailableLanguages();
    }, [loadAvailableBadges, loadAvailableLanguages]);

    const handleAddBadgeType = async () => {
        if (!newBadgeName || !newBadgeColor) return;
        setIsLoading(true);
        appendOutput(`Adding new badge type "${newBadgeName}"...`);
        try {
            const result = await addBadge(newBadgeName, newBadgeColor);
            appendOutput(result);
            await loadAvailableBadges();
            setNewBadgeName("");
            setNewBadgeColor("#000000");
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleRemoveBadgeType = async (badgeName: string) => {
        setIsLoading(true);
        appendOutput(`Removing badge type "${badgeName}"...`);
        try {
            const result = await removeBadge(badgeName);
            appendOutput(result);
            await loadAvailableBadges();
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleAddBadge = async () => {
        if (!badgeUserId || !badgeTitle) return;
        setIsLoading(true);
        appendOutput(`Adding badge to user ${badgeUserId}...`);
        try {
            const result = await assignBadgeToUser(parseInt(badgeUserId), badgeTitle);
            appendOutput(result);
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleRemoveBadge = async () => {
        if (!badgeUserId || !badgeTitle) return;
        setIsLoading(true);
        appendOutput(`Removing badge from user ${badgeUserId}...`);
        try {
            const result = await removeBadgeFromUser(parseInt(badgeUserId), badgeTitle);
            appendOutput(result);
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleListBadges = async () => {
        setIsLoading(true);
        appendOutput("Listing badges...");
        try {
            const badges = await listBadges();
            if (badges.length > 0) {
                appendOutput("Badges:");
                badges.forEach((b: UserBadge) => {
                    appendOutput(`${b.user_id} | ${b.username} | ${b.badge_name} | ${b.color} | ${b.assigned_at}`);
                });
            } else {
                appendOutput("No badges found");
            }
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleAddMapset = async () => {
        if (!mapsetId) return;
        setIsLoading(true);
        appendOutput(`Adding mapset ${mapsetId}...`);
        try {
            await addMapset(parseInt(mapsetId));
            appendOutput("Mapset added successfully");
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleRemoveMapset = async () => {
        if (!mapsetId) return;
        setIsLoading(true);
        appendOutput(`Removing mapset ${mapsetId}...`);
        try {
            await removeMapset(parseInt(mapsetId));
            appendOutput("Mapset removed successfully");
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleListMapsets = async () => {
        consoleDivRef.current?.scrollIntoView({
            behavior: "smooth",
        });

        setIsLoading(true);
        appendOutput("Listing mapsets...");
        try {
            const mapsets = await listMapsets();
            if (mapsets.length > 0) {
                appendOutput("Mapsets:");
                mapsets.forEach((m: Mapset) => {
                    appendOutput(`${m.mapset_id} | ${m.title} | ${m.artist} | ${m.mapper} | ${m.image_filename} | ${m.audio_filename}`);
                });
            } else {
                appendOutput("No mapsets found");
            }
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleBulkUpload = async () => {
        consoleDivRef.current?.scrollIntoView({
            behavior: "smooth",
        });

        if (!bulkFile) return;

        setIsLoading(true);
        appendOutput("Starting bulk upload process...");

        try {
            const content = await bulkFile.text();
            const result = await processBulkMapsets(content);

            appendOutput(`Bulk upload completed:
            Total mapsets: ${result.total}
            Successful: ${result.successful}
            Failed: ${result.failed}`);
        } catch (error) {
            appendOutput(`Error during bulk upload: ${error}`);
        } finally {
            setIsLoading(false);
            setBulkFile(null);
        }
    };

    const handleSyncUsers = async () => {
        consoleDivRef.current?.scrollIntoView({
            behavior: "smooth",
        });

        setIsLoading(true);
        appendOutput("Syncing user achievements...");
        try {
            await syncUserAchievements();
            appendOutput("User achievements synced successfully");
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleCheckTranslation = async () => {
        consoleDivRef.current?.scrollIntoView({
            behavior: "smooth",
        });

        if (!languageCode) return;
        setIsLoading(true);
        appendOutput(`Checking translations for language: ${languageCode}`);
        try {
            const result = await checkTranslation(languageCode);
            if (result.success && result.extraKeys) {
                appendOutput(`
    Translation check completed for ${result.languageCode}:
    Total keys: ${result.totalKeys}
    Completed: ${result.completedKeys}
    Missing: ${result.missingKeys.length}
    Extra: ${result.extraKeys.length}

    Missing keys:
    ${result.missingKeys.map((key) => `- ${key}`).join("\n")}

    Extra keys:
    ${result.extraKeys.map((key) => `- ${key}`).join("\n")}`);

                if (autoFill && result.missingKeys?.length > 0) {
                    const fillResult = await fillMissingTranslations(languageCode);
                    if (fillResult.success) {
                        appendOutput(`\nAuto-filled ${fillResult.filledCount} missing translations with English values`);
                    } else {
                        appendOutput(`\nError auto-filling translations: ${fillResult.error}`);
                    }
                }

                if (removeExtra && result.extraKeys?.length > 0) {
                    const removeResult = await removeExtraTranslations(languageCode);
                    if (removeResult.success) {
                        appendOutput(`\nRemoved ${removeResult.removedCount} extra translations`);
                    } else {
                        appendOutput(`\nError removing extra translations: ${removeResult.error}`);
                    }
                }
            } else {
                appendOutput(`Error: ${result.error}`);
            }
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleCheckAllLanguages = async () => {
        consoleDivRef.current?.scrollIntoView({
            behavior: "smooth",
        });

        setIsLoading(true);
        appendOutput("Checking all translations...");

        for (const lang of availableLanguages) {
            appendOutput(`\nChecking ${lang}...`);
            setLanguageCode(lang);
            const result = await checkTranslation(lang);

            if (result.success && result.missingKeys) {
                appendOutput(`
    Translation check completed for ${result.languageCode}:
    Total keys: ${result.totalKeys}
    Completed: ${result.completedKeys}
    Missing: ${result.missingKeys.length}
    Extra: ${result.extraKeys.length}

    Missing keys:
    ${result.missingKeys.map((key) => `- ${key}`).join("\n")}

    Extra keys:
    ${result.extraKeys.map((key) => `- ${key}`).join("\n")}`);

                if (autoFill && result.missingKeys.length > 0) {
                    const fillResult = await fillMissingTranslations(lang);
                    if (fillResult.success) {
                        appendOutput(`\nAuto-filled ${fillResult.filledCount} missing translations with English values`);
                    } else {
                        appendOutput(`\nError auto-filling translations: ${fillResult.error}`);
                    }
                }

                if (removeExtra && result.extraKeys.length > 0) {
                    const removeResult = await removeExtraTranslations(lang);
                    if (removeResult.success) {
                        appendOutput(`\nRemoved ${removeResult.removedCount} extra translations`);
                    } else {
                        appendOutput(`\nError removing extra translations: ${removeResult.error}`);
                    }
                }
            } else {
                appendOutput(`Error: ${result.error}`);
            }
        }

        setLanguageCode("");
        setIsLoading(false);
    };

    const handleDeploy = async () => {
        setIsLoading(true);
        appendOutput("Starting deployment...");

        try {
            const result = await deploy();
            if (result.success) {
                appendOutput("Deployment successful!");
            } else {
                appendOutput(`Deployment failed: ${result.message}`);
            }
        } catch (error) {
            console.log(error);
            appendOutput(`Deployment error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSkinById = async () => {
        if (!skinSingleId) return appendOutput("Provide skin id");
        setIsLoading(true);
        appendOutput(`Adding skin ${skinSingleId}...`);
        try {
            const res = (await addSkinById(parseInt(skinSingleId))) as { success: boolean; skinId?: number; image?: string; error?: string };
            if (res && res.success) {
                appendOutput(`Added skin ${res.skinId} -> ${res.image}`);
            } else {
                appendOutput(`Add skin failed: ${res?.error || JSON.stringify(res)}`);
            }
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleAddSkinsFromFile = async () => {
        if (!skinListFile) return appendOutput("Provide a .txt file with skin IDs (one per line)");
        setIsLoading(true);
        appendOutput(`Adding skins from file...`);
        try {
            const content = await skinListFile.text();
            const ids = content
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean)
                .map((v) => parseInt(v))
                .filter((n) => !Number.isNaN(n));

            if (ids.length === 0) {
                appendOutput("No valid IDs found in file");
                setIsLoading(false);
                return;
            }

            const results = await addSkinsFromList(ids);
            appendOutput(`Processed ${results.length} skins:`);
            results.forEach((r) => appendOutput(`${r.id} -> ${r.success ? `OK (${r.image})` : `FAILED (${r.error})`}`));
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
        setSkinListFile(null);
    };

    const handleListSkins = async () => {
        setIsLoading(true);
        appendOutput("Listing skins...");
        try {
            const skins = ((await listSkins()) as Array<{ id: number; name: string; creator: string; image_filename: string }>) || [];
            appendOutput(`Found ${skins.length} skins`);
            skins.forEach((s) => appendOutput(`${s.id} | ${s.name} | ${s.creator} | ${s.image_filename}`));
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    const handleRemoveSkin = async () => {
        if (!skinRemoveId) return;
        setIsLoading(true);
        appendOutput(`Removing skin ${skinRemoveId}...`);
        try {
            const res = await removeSkin(parseInt(skinRemoveId));
            appendOutput(JSON.stringify(res));
            await handleListSkins();
        } catch (error) {
            appendOutput(`Error: ${error}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <Button onClick={handleDeploy} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                    Deploy Latest Changes
                </Button>
            </div>

            <CollapsibleSection title="Mapset Management">
                <div className="space-y-8">
                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Single Mapset</h3>
                        <div className="flex gap-4">
                            <Input type="number" placeholder="Mapset ID" value={mapsetId} onChange={(e) => setMapsetId(e.target.value)} />
                            <Button onClick={handleAddMapset} disabled={isLoading}>
                                Add Mapset
                            </Button>
                            <Button onClick={handleRemoveMapset} disabled={isLoading} variant="destructive">
                                Remove Mapset
                            </Button>
                            <Button onClick={handleListMapsets} disabled={isLoading} variant="outline">
                                List Mapsets
                            </Button>
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Bulk Upload Mapsets</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Input type="file" accept=".txt" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} className="flex-1" />
                                <Button onClick={handleBulkUpload} disabled={isLoading || !bulkFile}>
                                    Upload Mapsets
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Upload a text file containing osu! beatmap URLs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Skins Management">
                <div className="space-y-4">
                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Random Skin</h3>
                        <div className="flex gap-4">
                            <Button onClick={handleListSkins} disabled={isLoading} variant="outline">
                                List Skins
                            </Button>
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Add Skin by ID or List</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Input placeholder="Skin ID" value={skinSingleId} onChange={(e) => setSkinSingleId(e.target.value)} />
                                <Button onClick={handleAddSkinById} disabled={isLoading}>
                                    Add Skin by ID
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <Input type="file" accept=".txt" onChange={(e) => setSkinListFile(e.target.files?.[0] || null)} className="flex-1" />
                                <Button onClick={handleAddSkinsFromFile} disabled={isLoading || !skinListFile}>
                                    Upload Skin IDs
                                </Button>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <p>Provide a .txt file with one skin ID per line, or enter a single ID above.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Remove Skin</h3>
                        <div className="flex gap-4">
                            <Input placeholder="Skin ID" value={skinRemoveId} onChange={(e) => setSkinRemoveId(e.target.value)} />
                            <Button onClick={handleRemoveSkin} disabled={isLoading} variant="destructive">
                                Remove Skin
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Badge Management">
                <div className="space-y-8">
                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Assign User Badges</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="number" placeholder="User ID" value={badgeUserId} onChange={(e) => setBadgeUserId(e.target.value)} />
                                <select
                                    className="rounded-md border border-input bg-transparent px-3 py-1"
                                    value={badgeTitle}
                                    onChange={(e) => {
                                        setBadgeTitle(e.target.value);
                                        setBadgeColor(availableBadges[e.target.value] || "");
                                    }}
                                >
                                    <option value="">Select Badge Type</option>
                                    {Object.keys(availableBadges).map((badge) => (
                                        <option key={badge} value={badge}>
                                            {badge}
                                        </option>
                                    ))}
                                </select>
                                <Input type="text" placeholder="Badge Color (hex)" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} />
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={handleAddBadge} disabled={isLoading}>
                                    Add Badge
                                </Button>
                                <Button onClick={handleRemoveBadge} disabled={isLoading} variant="destructive">
                                    Remove Badge
                                </Button>
                                <Button onClick={handleListBadges} disabled={isLoading} variant="outline">
                                    List Badges
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Manage Badge Types</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="text" placeholder="Badge Name" value={newBadgeName} onChange={(e) => setNewBadgeName(e.target.value)} />
                                <Input type="color" value={newBadgeColor} onChange={(e) => setNewBadgeColor(e.target.value)} className="h-9 w-full" />
                            </div>
                            <Button onClick={handleAddBadgeType} disabled={isLoading || !newBadgeName || !newBadgeColor}>
                                Add New Badge Type
                            </Button>

                            <div className="mt-4">
                                <h4 className="text-md font-medium mb-2">Available Badge Types</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(availableBadges).map(([name, color]) => (
                                        <div key={name} className="flex items-center justify-between p-2 bg-background/50 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                                                <span>{name}</span>
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => handleRemoveBadgeType(name)} disabled={isLoading}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="User">
                <div className="bg-secondary/20 p-6 rounded-xl">
                    <Button onClick={handleSyncUsers} disabled={isLoading}>
                        Sync User Achievements
                    </Button>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Translation Management">
                <div className="bg-secondary/20 p-6 rounded-xl">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="auto-fill" checked={autoFill} onCheckedChange={setAutoFill} />
                                <Label htmlFor="auto-fill">Auto-fill missing translations</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="remove-extra" checked={removeExtra} onCheckedChange={setRemoveExtra} />
                                <Label htmlFor="remove-extra">Remove extra keys</Label>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <select className="rounded-md border border-input bg-transparent px-3 py-1 flex-1" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}>
                                <option value="">Select Language</option>
                                {availableLanguages.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                            <Button onClick={handleCheckTranslation} disabled={isLoading || !languageCode}>
                                Check Translation
                            </Button>
                            <Button onClick={handleCheckAllLanguages} disabled={isLoading} variant="outline">
                                Check All Languages
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Select a language to check missing translations. Toggle auto-fill to automatically copy English values for missing translations.</p>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Report Management">
                <div className="space-y-4">
                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">View and Manage Reports</h3>
                        <Button
                            onClick={async () => {
                                setIsLoading(true);
                                appendOutput("Listing reports...");
                                try {
                                    const reports = await listReports();
                                    if (reports.length > 0) {
                                        appendOutput("Reports:");
                                        reports.forEach((r) => {
                                            appendOutput(`${r.id} | ${r.user_id} | ${r.mapset_id} | ${r.report_type} | ${r.status} | ${new Date(r.created_at).toLocaleString()}`);
                                        });
                                    } else {
                                        appendOutput("No reports found");
                                    }
                                } catch (error) {
                                    appendOutput(`Error: ${error}`);
                                }
                                setIsLoading(false);
                            }}
                            disabled={isLoading}
                            variant="outline"
                        >
                            List Reports
                        </Button>
                    </div>
                    <div className="bg-secondary/20 p-6 rounded-xl">
                        <h3 className="text-lg font-medium mb-4">Update Report Status</h3>
                        <div className="flex gap-4">
                            <Input type="number" placeholder="Report ID" onChange={(e) => setReportId(e.target.value)} className="w-1/4" />
                            <select className="rounded-md border border-input bg-transparent px-3 py-1 w-1/4" onChange={(e) => setReportStatus(e.target.value)}>
                                <option value="pending">pending</option>
                                <option value="investigating">investigating</option>
                                <option value="resolved">resolved</option>
                                <option value="rejected">rejected</option>
                            </select>
                            <Button
                                onClick={async () => {
                                    setIsLoading(true);
                                    appendOutput(`Updating report ${reportId} to ${reportStatus}...`);
                                    try {
                                        await updateReportStatus(parseInt(reportId), reportStatus);
                                        appendOutput(`Report ${reportId} updated successfully`);
                                    } catch (error) {
                                        appendOutput(`Error: ${error}`);
                                    }
                                    setIsLoading(false);
                                }}
                                disabled={isLoading}
                            >
                                Update Status
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <div className="bg-card p-6 rounded-lg border border-border" ref={consoleDivRef}>
                <h2 className="text-xl font-semibold mb-4">Console Output</h2>
                <pre className="bg-background p-4 rounded-md h-64 overflow-y-auto whitespace-pre-wrap">{output}</pre>
                <Button onClick={() => setOutput("")} variant="outline" className="mt-2">
                    Clear Console
                </Button>
            </div>
        </div>
    );
}
