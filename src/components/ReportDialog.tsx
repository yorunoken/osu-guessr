"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { ReportType, createReportAction } from "@/actions/reports-server";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportDialogProps {
    mapsetId: number;
    mapsetTitle: string;
    onOpenChange?: (open: boolean) => void;
}

const REPORT_TYPES = [
    { value: "incorrect_title", label: "Incorrect Title" },
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "wrong_audio", label: "Wrong Audio" },
    { value: "wrong_background", label: "Wrong Background" },
    { value: "other", label: "Other" },
] as const;

export function ReportDialog({ mapsetId, mapsetTitle, onOpenChange }: ReportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportType, setReportType] = useState<ReportType>("incorrect_title");
    const [description, setDescription] = useState("");
    const { toast } = useToast();

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    const handleSubmit = async () => {
        if (description.length < 10) {
            toast({ description: "Please provide a more detailed description" });
            return;
        }

        setIsSubmitting(true);
        try {
            await createReportAction(mapsetId, reportType, description);
            toast({ description: "Report submitted successfully" });
            handleOpenChange(false);
            setDescription("");
        } catch {
            toast({ description: "Failed to submit report" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Reporting issue for: {mapsetTitle}</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Issue Type</Label>
                        <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                            {REPORT_TYPES.map((type) => (
                                <div key={type.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={type.value} id={type.value} />
                                    <Label htmlFor={type.value}>{type.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide details about the issue..." className="h-32" />
                        <p className="text-xs text-muted-foreground">Minimum 10 characters required</p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || description.length < 10}>
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
