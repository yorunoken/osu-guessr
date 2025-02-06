import presetBadges from "../app/admin/actions/badges.json";

export const PRESET_BADGES = presetBadges;
export type PresetBadge = keyof typeof PRESET_BADGES;
