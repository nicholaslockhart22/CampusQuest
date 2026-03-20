import type { StatKey } from "./types";

export type CosmeticSlot = "hat" | "glasses" | "backpack";

/** Boss drop rarity; drop rates differ for regular vs final bosses. */
export type LootRarity = "common" | "uncommon" | "rare" | "legendary";

export interface CosmeticItem {
  id: string;
  slot: CosmeticSlot;
  label: string;
  icon: string;
  rarity: LootRarity;
  /** If set, requires an achievement string to be present. */
  requiresAchievement?: string;
  /** If set, requires reaching at least this level. */
  requiresLevel?: number;
  /** Optional: suggest a stat theme. */
  themeStat?: StatKey;
}

export const COSMETICS: CosmeticItem[] = [
  { id: "hat:cap", slot: "hat", label: "Cap", icon: "🧢", rarity: "common", requiresAchievement: "First Quest Completed", themeStat: "social" },
  { id: "hat:beanie", slot: "hat", label: "Beanie", icon: "🧶", rarity: "common", requiresAchievement: "7-Day Streak", themeStat: "focus" },
  { id: "hat:wizard", slot: "hat", label: "Wizard hat", icon: "🧙", rarity: "uncommon", requiresLevel: 5, themeStat: "knowledge" },
  { id: "hat:crown", slot: "hat", label: "Crown", icon: "👑", rarity: "legendary", requiresLevel: 10, themeStat: "strength" },
  { id: "hat:ramhorn", slot: "hat", label: "Ram's Pride", icon: "🦌", rarity: "legendary", requiresLevel: 3, themeStat: "strength" },

  { id: "glasses:round", slot: "glasses", label: "Round glasses", icon: "👓", rarity: "common", requiresAchievement: "First Quest Completed", themeStat: "knowledge" },
  { id: "glasses:square", slot: "glasses", label: "Square glasses", icon: "🕶️", rarity: "uncommon", requiresLevel: 4, themeStat: "focus" },
  { id: "glasses:sunglasses", slot: "glasses", label: "Sunglasses", icon: "😎", rarity: "common", requiresAchievement: "7-Day Streak", themeStat: "social" },

  { id: "backpack:backpack", slot: "backpack", label: "Backpack", icon: "🎒", rarity: "common", requiresAchievement: "First Quest Completed", themeStat: "knowledge" },
  { id: "backpack:satchel", slot: "backpack", label: "Satchel", icon: "👜", rarity: "uncommon", requiresLevel: 6, themeStat: "social" },
  { id: "backpack:cape", slot: "backpack", label: "Cape", icon: "🦸", rarity: "rare", requiresLevel: 8, themeStat: "strength" },

  // 40 additional loot drops
  { id: "hat:beret", slot: "hat", label: "Beret", icon: "🎩", rarity: "common", themeStat: "social" },
  { id: "hat:headband", slot: "hat", label: "Headband", icon: "🎀", rarity: "common", themeStat: "focus" },
  { id: "hat:tophat", slot: "hat", label: "Top hat", icon: "🎩", rarity: "uncommon", themeStat: "social" },
  { id: "hat:graduation", slot: "hat", label: "Graduation cap", icon: "🎓", rarity: "common", themeStat: "knowledge" },
  { id: "hat:helmet", slot: "hat", label: "Knight helmet", icon: "⛑️", rarity: "rare", themeStat: "strength" },
  { id: "hat:baseball", slot: "hat", label: "Baseball cap", icon: "🧢", rarity: "common", themeStat: "social" },
  { id: "hat:propeller", slot: "hat", label: "Propeller beanie", icon: "🧢", rarity: "uncommon", themeStat: "focus" },
  { id: "hat:fez", slot: "hat", label: "Fez", icon: "🧢", rarity: "uncommon", themeStat: "knowledge" },
  { id: "hat:straw", slot: "hat", label: "Straw hat", icon: "👒", rarity: "common", themeStat: "stamina" },
  { id: "hat:witch", slot: "hat", label: "Witch hat", icon: "👒", rarity: "rare", themeStat: "knowledge" },
  { id: "hat:elf", slot: "hat", label: "Elf cap", icon: "🧝", rarity: "uncommon", themeStat: "focus" },
  { id: "hat:ram", slot: "hat", label: "Ram Spirit", icon: "🐏", rarity: "legendary", themeStat: "strength" },
  { id: "hat:star", slot: "hat", label: "Star crown", icon: "⭐", rarity: "rare", themeStat: "knowledge" },

  { id: "glasses:monocle", slot: "glasses", label: "Monocle", icon: "👁️", rarity: "rare", themeStat: "knowledge" },
  { id: "glasses:goggles", slot: "glasses", label: "Goggles", icon: "🥽", rarity: "common", themeStat: "focus" },
  { id: "glasses:nerd", slot: "glasses", label: "Nerd glasses", icon: "🤓", rarity: "common", themeStat: "knowledge" },
  { id: "glasses:cool", slot: "glasses", label: "Cool shades", icon: "😎", rarity: "uncommon", themeStat: "social" },
  { id: "glasses:visor", slot: "glasses", label: "Safety visor", icon: "🥽", rarity: "common", themeStat: "stamina" },
  { id: "glasses:heart", slot: "glasses", label: "Heart shades", icon: "😍", rarity: "uncommon", themeStat: "social" },
  { id: "glasses:reading", slot: "glasses", label: "Reading glasses", icon: "📖", rarity: "common", themeStat: "knowledge" },
  { id: "glasses:steampunk", slot: "glasses", label: "Steampunk goggles", icon: "⚙️", rarity: "rare", themeStat: "focus" },
  { id: "glasses:laser", slot: "glasses", label: "Laser focus", icon: "👁️", rarity: "rare", themeStat: "focus" },
  { id: "glasses:gold", slot: "glasses", label: "Gold frames", icon: "👓", rarity: "legendary", themeStat: "social" },
  { id: "glasses:cat", slot: "glasses", label: "Cat-eye frames", icon: "🐱", rarity: "uncommon", themeStat: "social" },
  { id: "glasses:aviator", slot: "glasses", label: "Aviators", icon: "🕶️", rarity: "uncommon", themeStat: "strength" },
  { id: "glasses:rainbow", slot: "glasses", label: "Rainbow lenses", icon: "🌈", rarity: "rare", themeStat: "social" },

  { id: "backpack:hiking", slot: "backpack", label: "Hiking pack", icon: "🎒", rarity: "common", themeStat: "stamina" },
  { id: "backpack:briefcase", slot: "backpack", label: "Briefcase", icon: "💼", rarity: "uncommon", themeStat: "knowledge" },
  { id: "backpack:duffel", slot: "backpack", label: "Duffel bag", icon: "🎒", rarity: "common", themeStat: "strength" },
  { id: "backpack:purse", slot: "backpack", label: "Crossbody", icon: "👜", rarity: "common", themeStat: "social" },
  { id: "backpack:wings", slot: "backpack", label: "Angel wings", icon: "👼", rarity: "legendary", themeStat: "stamina" },
  { id: "backpack:shield", slot: "backpack", label: "Shield", icon: "🛡️", rarity: "rare", themeStat: "strength" },
  { id: "backpack:books", slot: "backpack", label: "Book stack", icon: "📚", rarity: "common", themeStat: "knowledge" },
  { id: "backpack:treasure", slot: "backpack", label: "Treasure chest", icon: "📦", rarity: "rare", themeStat: "knowledge" },
  { id: "backpack:parachute", slot: "backpack", label: "Parachute pack", icon: "🪂", rarity: "uncommon", themeStat: "stamina" },
  { id: "backpack:jetpack", slot: "backpack", label: "Jetpack", icon: "🚀", rarity: "rare", themeStat: "strength" },
  { id: "backpack:scroll", slot: "backpack", label: "Scroll case", icon: "📜", rarity: "uncommon", themeStat: "knowledge" },
  { id: "backpack:quiver", slot: "backpack", label: "Quiver", icon: "🏹", rarity: "rare", themeStat: "focus" },
  { id: "backpack:flower", slot: "backpack", label: "Flower bouquet", icon: "💐", rarity: "common", themeStat: "social" },
  { id: "backpack:toolbox", slot: "backpack", label: "Toolbox", icon: "🧰", rarity: "uncommon", themeStat: "focus" },
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

/** Regular boss drop rates: Common 60%, Uncommon 30%, Rare 9.9%, Legendary 0.1% */
const REGULAR_BOSS_RATES: { rarity: LootRarity; pct: number }[] = [
  { rarity: "common", pct: 60 },
  { rarity: "uncommon", pct: 30 },
  { rarity: "rare", pct: 9.9 },
  { rarity: "legendary", pct: 0.1 },
];
/** Final boss drop rates: Common 1%, others boosted so final bosses feel rewarding */
const FINAL_BOSS_RATES: { rarity: LootRarity; pct: number }[] = [
  { rarity: "common", pct: 1 },
  { rarity: "uncommon", pct: 44 },
  { rarity: "rare", pct: 35 },
  { rarity: "legendary", pct: 20 },
];

function rollRarity(isFinalBoss: boolean): LootRarity {
  const rates = isFinalBoss ? FINAL_BOSS_RATES : REGULAR_BOSS_RATES;
  const r = Math.random() * 100;
  let acc = 0;
  for (const { rarity, pct } of rates) {
    acc += pct;
    if (r < acc) return rarity;
  }
  return "common";
}

export function pickLootCosmetic(args: {
  isFinalBoss: boolean;
  achievements: string[];
  level: number;
  unlockedCosmetics?: string[] | null;
}): CosmeticItem {
  const { isFinalBoss, achievements, level, unlockedCosmetics } = args;
  const locked = COSMETICS.filter((c) => !isCosmeticUnlocked({ cosmeticId: c.id, achievements, level, unlockedCosmetics }));
  const rarity = rollRarity(isFinalBoss);
  const pool =
    locked.length > 0
      ? (() => {
          const lockedOfRarity = locked.filter((c) => c.rarity === rarity);
          return lockedOfRarity.length > 0 ? lockedOfRarity : locked;
        })()
      : COSMETICS.filter((c) => c.rarity === rarity).length > 0
        ? COSMETICS.filter((c) => c.rarity === rarity)
        : COSMETICS;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

