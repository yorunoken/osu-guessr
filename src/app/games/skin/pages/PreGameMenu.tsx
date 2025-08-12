"use client";

import { GameVariant } from "../../config";
import PreGameMenu from "../../shared/pages/PreGameMenu";

interface PreGameMenuProps {
    onStart(variant: GameVariant): void;
}

export default function SkinPreGameMenu({ onStart }: PreGameMenuProps) {
    return <PreGameMenu onStart={onStart} gameMode="skin" />;
}
