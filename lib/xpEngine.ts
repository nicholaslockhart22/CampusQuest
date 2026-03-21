import { streakMultiplier } from "./level";
import { getClassXpMultiplier } from "./classXpBonus";
import { getLootXpMultiplier } from "./gameBuffs";
import { skillXpMultiplierForActivity } from "./skillTree";
import type { Character } from "./types";
import { getActivityById } from "./activities";

export interface XpModifierLine {
  label: string;
  multiplier: number; // applied in sequence (compound) — we store as incremental factor for display
  emoji?: string;
}

export interface XpBreakdown {
  baseAfterMinutes: number;
  lines: XpModifierLine[];
  /** Compound multiplier from lines (product of multiplier fields — each line is delta factor) */
  compoundFactor: number;
  finalXp: number;
}

function isPeakHours(date: Date): boolean {
  const h = date.getHours();
  const day = date.getDay();
  // Morning rush 7–9, evening grind 20–23, weekday "library peak" 14–17
  if (h >= 7 && h < 9) return true;
  if (h >= 20 && h < 23) return true;
  if (day >= 1 && day <= 5 && h >= 14 && h < 17) return true;
  return false;
}

export function computeXpBreakdown(args: {
  character: Character;
  activityId: string;
  baseXp: number;
  minutes: number | undefined;
  streakDays: number;
  now?: Date;
  guildWeeklyBoostPct?: number;
}): XpBreakdown {
  const { character, activityId, baseXp, minutes, streakDays, now = new Date(), guildWeeklyBoostPct = 0 } = args;
  const def = getActivityById(activityId);
  const stat = def?.stat ?? "knowledge";

  let xp = baseXp;
  if (def?.usesMinutes && minutes != null && minutes > 0) {
    xp += Math.floor(minutes / 10) * 5;
  }

  const lines: XpModifierLine[] = [];
  let compound = 1;

  const sm = streakMultiplier(streakDays);
  if (sm > 1) {
    lines.push({
      label: `Streak bonus ×${sm.toFixed(2)}`,
      multiplier: sm,
      emoji: "🔥",
    });
    compound *= sm;
  }

  if (isPeakHours(now)) {
    const peak = 1.12;
    lines.push({ label: "Peak hours bonus ×1.12", multiplier: peak, emoji: "⚡" });
    compound *= peak;
  }

  const classM = getClassXpMultiplier(character.classId, activityId);
  if (classM > 1) {
    lines.push({
      label: `Class bonus ×${classM.toFixed(2)}`,
      multiplier: classM,
      emoji: "🎭",
    });
    compound *= classM;
  }

  const unlocked = character.unlockedSkillNodes ?? [];
  const sk = skillXpMultiplierForActivity(unlocked, activityId, stat);
  if (sk > 1) {
    lines.push({
      label: `Skill tree ×${sk.toFixed(2)}`,
      multiplier: sk,
      emoji: "🧠",
    });
    compound *= sk;
  }

  const lootM = getLootXpMultiplier(character, activityId);
  if (lootM > 1) {
    lines.push({
      label: `Equipment ×${lootM.toFixed(2)}`,
      multiplier: lootM,
      emoji: "🎁",
    });
    compound *= lootM;
  }

  if (guildWeeklyBoostPct > 0) {
    const g = 1 + guildWeeklyBoostPct / 100;
    lines.push({
      label: `Top guild last week ×${g.toFixed(2)}`,
      multiplier: g,
      emoji: "🛡️",
    });
    compound *= g;
  }

  const finalXp = Math.max(1, Math.floor(xp * compound));
  return {
    baseAfterMinutes: xp,
    lines,
    compoundFactor: compound,
    finalXp,
  };
}
