import { useTranslations } from "@/hooks/use-translations";

export default function LoadingScreen() {
    const { t } = useTranslations();

    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-lg font-medium text-foreground/70">{t.game.status.loading}</p>
            </div>
        </div>
    );
}
