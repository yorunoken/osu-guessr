"use client";

import { useState } from "react";
import PreGameMenu from "./pages/PreGameMenu";
import GameScreen from "./pages/GameScreen";

export default function Controller() {
    const [isGameStarted, setIsGameStarted] = useState(false);

    if (!isGameStarted) {
        return <PreGameMenu onStart={() => setIsGameStarted(true)} />;
    }

    return <GameScreen onExit={() => setIsGameStarted(false)} />;
}
