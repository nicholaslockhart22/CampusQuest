import type { StatKey } from "./types";

export type CosmeticSlot = "hat" | "glasses" | "backpack";

export interface CosmeticItem {
  id: string;
  slot: CosmeticSlot;
  label: string;
  icon: string;
  /** If set, requires an achievement string to be present. */
  requiresAchievement?: string;
  /** If set, requires reaching at least this level. */
  requiresLevel?: number;
  /** Optional: suggest a stat theme. */
  themeStat?: StatKey;
}

export const COSMETICS: CosmeticItem[] = [
  { id: "hat:cap", slot: "hat", label: "Cap", icon: "🧢", requiresAchievement: "First Quest Completed", themeStat: "social" },
  { id: "hat:beanie", slot: "hat", label: "Beanie", icon: "🧶", requiresAchievement: "7-Day Streak", themeStat: "focus" },
  { id: "hat:wizard", slot: "hat", label: "Wizard hat", icon: "🧙", requiresLevel: 5, themeStat: "knowledge" },
  { id: "hat:crown", slot: "hat", label: "Crown", icon: "👑", requiresLevel: 10, themeStat: "strength" },

  { id: "glasses:round", slot: "glasses", label: "Round glasses", icon: "👓", requiresAchievement: "First Quest Completed", themeStat: "knowledge" },
  { id: "glasses:square", slot: "glasses", label: "Square glasses", icon: "🕶️", requiresLevel: 4, themeStat: "focus" },
  { id: "glasses:sunglasses", slot: "glasses", label: "Sunglasses", icon: "😎", requiresAchievement: "7-Day Streak", themeStat: "social" },

  { id: "backpack:backpack", slot: "backpack", label: "Backpack", icon: "🎒", requiresAchievement: "First Quest Completed", themeStat: "knowledge" },
  { id: "backpack:satchel", slot: "backpack", label: "Satchel", icon: "👜", requiresLevel: 6, themeStat: "social" },
  { id: "backpack:cape", slot: "backpack", label: "Cape", icon: "🦸", requiresLevel: 8, themeStat: "strength" },
];

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETICS.find((c) => c.id === id);
}

export function isCosmeticUnlocked(args: {
  cosmeticId: string;
  achievements: string[];
  level: number;
  unlockedCosmetics?: string[] | null;
}): boolean {
  const { cosmeticId, achievements, level, unlockedCosmetics } = args;
  if (unlockedCosmetics?.includes(cosmeticId)) return true;
  const item = getCosmeticById(cosmeticId);
  if (!item) return false;
  if (item.requiresLevel != null && level < item.requiresLevel) return false;
  if (item.requiresAchievement != null && !achievements.includes(item.requiresAchievement)) return false;
  return true;
}

export function pickLootCosmetic(args: {
  achievements: string[];
  level: number;
  unlockedCosmetics?: string[] | null;
}): CosmeticItem | null {
  const { achievements, level, unlockedCosmetics } = args;
  const locked = COSMETICS.filter((c) => !isCosmeticUnlocked({ cosmeticId: c.id, achievements, level, unlockedCosmetics }));
  if (locked.length === 0) return null;
  return locked[Math.floor(Math.random() * locked.length)] ?? null;
}

