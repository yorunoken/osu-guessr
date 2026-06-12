"use client";

import { GameMode } from "@/actions/types";
import SharedGameScreen from "../../shared/pages/GameScreen";
import GameImage from "../components/GameImage";
import { GameVariant } from "../../config";

interface GameScreenProps {
    onExit(): void;
    variant: GameVariant;
}

export default function GameScreen({ onExit, variant }: GameScreenProps) {
    return <SharedGameScreen onExit={onExit} gameVariant={variant} gameMode={GameMode.Background} GameMedia={GameImage} />;
}
