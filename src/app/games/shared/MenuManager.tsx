"use client";

import { useState } from "react";
import { GameVariant } from "../config";

interface MenuManagerProps {
    PreGameMenu: React.ComponentType<{ onStart: (variant: GameVariant) => void }>;
    GameScreen: React.ComponentType<{ onExit: () => void; variant: GameVariant }>;
}

export default function MenuManager({ PreGameMenu, GameScreen }: MenuManagerProps) {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<GameVariant>("classic");

    if (!isGameStarted) {
        return (
            <PreGameMenu
                onStart={(variant) => {
                    setSelectedVariant(variant);
                    setIsGameStarted(true);
                }}
            />
        );
    }

    return <GameScreen onExit={() => setIsGameStarted(false)} variant={selectedVariant} />;
}
