"use client";

import { useState } from "react";

interface MenuManagerProps {
    PreGameMenu: React.ComponentType<{ onStart: () => void }>;
    GameScreen: React.ComponentType<{ onExit: () => void }>;
}

export default function MenuManager({ PreGameMenu, GameScreen }: MenuManagerProps) {
    const [isGameStarted, setIsGameStarted] = useState(false);

    if (!isGameStarted) {
        return <PreGameMenu onStart={() => setIsGameStarted(true)} />;
    }

    return <GameScreen onExit={() => setIsGameStarted(false)} />;
}
