import type { Character } from "./types";

export type LootBuffKind = "studyXpPct" | "streakSaveChancePct" | "gymXpPct" | "socialXpPct" | "allXpPct";

export interface LootBuff {
  kind: LootBuffKind;
  value: number; // percent points, e.g. 5 = +5%
  label: string;
}

/** Buffs keyed by cosmetic id (only items that actually grant stats). */
export const COSMETIC_BUFFS: Record<string, LootBuff> = {
  "hat:wizard": { kind: "studyXpPct", value: 5, label: "+5% study XP" },
  "glasses:nerd": { kind: "studyXpPct", value: 4, label: "+4% study XP" },
  "backpack:books": { kind: "studyXpPct", value: 5, label: "+5% study XP" },
  "hat:beanie": { kind: "streakSaveChancePct", value: 10, label: "+10% streak save roll" },
  "hat:ram": { kind: "streakSaveChancePct", value: 20, label: "+20% streak save chance" },
  "backpack:wings": { kind: "streakSaveChancePct", value: 15, label: "+15% streak save roll" },
  "hat:ramhorn": { kind: "gymXpPct", value: 5, label: "+5% gym XP" },
  "backpack:duffel": { kind: "gymXpPct", value: 5, label: "+5% gym XP" },
  "glasses:cool": { kind: "socialXpPct", value: 6, label: "+6% social XP" },
  "backpack:flower": { kind: "socialXpPct", value: 5, label: "+5% social XP" },
  "hat:crown": { kind: "allXpPct", value: 3, label: "+3% all XP" },
  "glasses:gold": { kind: "allXpPct", value: 4, label: "+4% all XP" },
};

/** Short equip effect for UI (matches COSMETIC_BUFFS.label when buffed). */
export function describeCosmeticEquipEffect(cosmeticId: string): string {
  const b = COSMETIC_BUFFS[cosmeticId];
  return b ? b.label : "Cosmetic only (no XP or streak bonus)";
}

const STUDY_IDS = new Set([
  "exam-prep",
  "study",
  "textbook",
  "office-hours",
  "flashcards",
  "lab",
]);
const GYM_IDS = new Set(["gym", "weights", "bodyweight", "sports-practice", "hiit"]);
const SOCIAL_IDS = new Set([
  "group-study",
  "club",
  "coffee-chat",
  "game-night",
  "volunteer",
  "meal-together",
]);

function equippedIds(c: Character): string[] {
  const e = c.equippedCosmetics;
  if (!e) return [];
  return [e.hat, e.glasses, e.backpack].filter(Boolean) as string[];
}

export function aggregateBuffs(character: Character): {
  studyXpPct: number;
  gymXpPct: number;
  socialXpPct: number;
  allXpPct: number;
  streakSaveChancePct: number;
  lines: string[];
} {
  const lines: string[] = [];
  let studyXpPct = 0;
  let gymXpPct = 0;
  let socialXpPct = 0;
  let allXpPct = 0;
  let streakSaveChancePct = 0;
  const unlocked = new Set(character.unlockedCosmetics ?? []);
  for (const id of equippedIds(character)) {
    if (!unlocked.has(id)) continue;
    const b = COSMETIC_BUFFS[id];
    if (!b) continue;
    lines.push(`${b.label}`);
    switch (b.kind) {
      case "studyXpPct":
        studyXpPct += b.value;
        break;
      case "gymXpPct":
        gymXpPct += b.value;
        break;
      case "socialXpPct":
        socialXpPct += b.value;
        break;
      case "allXpPct":
        allXpPct += b.value;
        break;
      case "streakSaveChancePct":
        streakSaveChancePct += b.value;
        break;
      default:
        break;
    }
  }
  return { studyXpPct, gymXpPct, socialXpPct, allXpPct, streakSaveChancePct, lines };
}

/** Multiplier from equipped loot for this activity (1 + stacked percents / 100). */
export function getLootXpMultiplier(character: Character, activityId: string): number {
  const a = aggregateBuffs(character);
  let pct = a.allXpPct;
  if (STUDY_IDS.has(activityId)) pct += a.studyXpPct;
  if (GYM_IDS.has(activityId)) pct += a.gymXpPct;
  if (SOCIAL_IDS.has(activityId)) pct += a.socialXpPct;
  return 1 + pct / 100;
}

/** 0–1 chance to save streak (rolled when streak would break). */
export function rollStreakSave(character: Character): boolean {
  const p = aggregateBuffs(character).streakSaveChancePct / 100;
  if (p <= 0) return false;
  return Math.random() < Math.min(0.45, p);
}
