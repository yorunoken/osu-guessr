import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>

                    <div className="space-y-4 mb-8">
                        <p className="text-foreground/70">
                            Oops! Looks like you{"'"}ve hit a missing circle. The page you{"'"}re looking for doesn{"'"}t exist.
                        </p>
                        <p className="text-foreground/70">Try clicking back to the rhythm or start fresh from the homepage.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button className="w-full sm:w-auto">Return Home</Button>
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-sm text-foreground/50">
                            If you believe this is an error, please{" "}
                            <Link href="https://github.com/yorunoken/osu-guessr/issues" className="text-primary hover:underline">
                                report it
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
