"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApiKeyAction, listApiKeysAction, deleteApiKeyAction, ApiKey } from "@/actions/api-keys-server";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, AlertCircle, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function SettingsClient() {
    const [apiKeys, setApiKeys] = useState<Array<ApiKey & { showValue?: boolean; copied?: boolean }>>([]);
    const [newKeyName, setNewKeyName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingKeys, setIsLoadingKeys] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);

    useEffect(() => {
        loadApiKeys();
    }, []);

    async function loadApiKeys() {
        setIsLoadingKeys(true);
        try {
            const keys = await listApiKeysAction();
            setApiKeys(keys.map((key) => ({ ...key, showValue: false, copied: false })));
        } catch (error) {
            console.error("Failed to load API keys:", error);
        } finally {
            setIsLoadingKeys(false);
        }
    }

    async function handleCreateKey() {
        if (!newKeyName.trim()) return;

        setIsLoading(true);
        try {
            const keyValue = await createApiKeyAction(newKeyName);
            setApiKeys((prev) => [
                {
                    id: keyValue,
                    name: newKeyName,
                    created_at: new Date(),
                    last_used: null,
                    user_id: 0,
                    showValue: true,
                    copied: false,
                },
                ...prev,
            ]);
            setNewKeyName("");
            setShowCreateDialog(false);
        } catch (error) {
            console.error("Failed to create API key:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteKey() {
        if (!keyToDelete) return;

        try {
            await deleteApiKeyAction(keyToDelete.id);
            setApiKeys((prev) => prev.filter((key) => key.id !== keyToDelete.id));
            setKeyToDelete(null);
        } catch (error) {
            console.error("Failed to delete API key:", error);
        }
    }

    const toggleKeyVisibility = (keyId: string) => {
        setApiKeys((prev) => prev.map((key) => (key.id === keyId ? { ...key, showValue: !key.showValue } : key)));
    };

    const copyKey = async (keyId: string) => {
        await navigator.clipboard.writeText(keyId);
        setApiKeys((prev) => prev.map((key) => (key.id === keyId ? { ...key, copied: true } : key)));
        setTimeout(() => {
            setApiKeys((prev) => prev.map((key) => (key.id === keyId ? { ...key, copied: false } : key)));
        }, 2000);
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Settings</h1>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">API Keys</h2>
                        <p className="text-sm text-foreground/70">{apiKeys.length}/5 keys used</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Important Security Information</AlertTitle>
                                <AlertDescription className="mt-2">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Keep your API keys secure and never share them publicly</li>
                                        <li>If a key is exposed, delete it immediately and create a new one</li>
                                        <li>Each key has full access to your account{"'"}s API capabilities</li>
                                    </ul>
                                    <Link href="https://github.com/yorunoken/osu-guessr/blob/main/docs/API.md" target="_blank" className="mt-2 inline-block text-primary hover:underline">
                                        View API Documentation →
                                    </Link>
                                </AlertDescription>
                            </Alert>

                            <Button onClick={() => setShowCreateDialog(true)} disabled={apiKeys.length >= 5} className="w-full sm:w-auto">
                                Create New API Key
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Your API Keys</h3>
                            <div className="divide-y divide-border/50">
                                {isLoadingKeys ? (
                                    <div className="py-8 flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-foreground/70" />
                                    </div>
                                ) : apiKeys.length === 0 ? (
                                    <p className="text-center py-4 text-foreground/70">No API keys yet</p>
                                ) : (
                                    apiKeys.map((key) => (
                                        <div key={key.id} className="py-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{key.name}</p>
                                                    <p className="text-sm text-foreground/70">Created: {new Date(key.created_at).toLocaleDateString()}</p>
                                                    {key.last_used && <p className="text-sm text-foreground/70">Last used: {new Date(key.last_used).toLocaleDateString()}</p>}
                                                </div>
                                                <Button variant="destructive" onClick={() => setKeyToDelete(key)}>
                                                    Delete
                                                </Button>
                                            </div>
                                            <div className="relative">
                                                <div className="flex items-center gap-2 p-2 bg-background rounded border border-border/50">
                                                    <code className="font-mono text-sm flex-1 overflow-x-auto">{key.showValue ? key.id : "•".repeat(64)}</code>
                                                    <Button size="icon" variant="ghost" onClick={() => toggleKeyVisibility(key.id)}>
                                                        {key.showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => copyKey(key.id)}>
                                                        {key.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New API Key</DialogTitle>
                        <DialogDescription>Enter a name for your new API key. This will help you identify it later.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name" className="w-full" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateKey} disabled={isLoading || !newKeyName.trim()}>
                            Create Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!keyToDelete} onOpenChange={(open) => !open && setKeyToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete API Key
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            <p className="mb-2">
                                Are you sure you want to delete the API key {'"'}
                                {keyToDelete?.name}
                                {'"'}?
                            </p>
                            <p className="font-medium text-destructive">This action cannot be undone and will immediately revoke access for any services using this key.</p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setKeyToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteKey}>
                            Delete Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
