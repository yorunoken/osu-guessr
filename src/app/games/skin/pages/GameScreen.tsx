"use client";

import SharedGameScreen from "../../shared/pages/GameScreen";
import GameSkin from "../components/GameSkin";
import { GameVariant } from "../../config";

interface GameScreenProps {
    onExit(): void;
    variant: GameVariant;
}

export default function GameScreen({ onExit, variant }: GameScreenProps) {
    return <SharedGameScreen onExit={onExit} gameVariant={variant} gameMode="skin" GameMedia={GameSkin} />;
}
