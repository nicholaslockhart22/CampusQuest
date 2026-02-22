// Spec: LEVEL_THRESHOLDS — XP needed to reach next level
// 1→2: 100, 2→3: 250, 3→4: 450, 4→5: 700; then +700 per level
const XP_PER_LEVEL: number[] = [100, 250, 450, 700];

function getCumulativeForLevel(level: number): number {
  if (level <= 1) return 0;
  let sum = 0;
  for (let i = 0; i < Math.min(level - 1, XP_PER_LEVEL.length); i++) {
    sum += XP_PER_LEVEL[i];
  }
  for (let i = XP_PER_LEVEL.length; i < level - 1; i++) {
    sum += 700;
  }
  return sum;
}

export function xpToLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  let level = 1;
  while (totalXP >= getCumulativeForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function xpProgressInLevel(totalXP: number): { current: number; needed: number } {
  const level = xpToLevel(totalXP);
  const xpAtLevelStart = getCumulativeForLevel(level);
  const xpAtNextLevel = getCumulativeForLevel(level + 1);
  const current = totalXP - xpAtLevelStart;
  const needed = xpAtNextLevel - xpAtLevelStart;
  return { current, needed };
}

/** Streak multiplier: 1.0 + (streak_days * 0.05), cap 2.0 */
export const STREAK_MULTIPLIER_CAP = 2.0;

export function streakMultiplier(streakDays: number): number {
  const mult = 1.0 + streakDays * 0.05;
  return Math.min(mult, STREAK_MULTIPLIER_CAP);
}

/** Daily minimum XP to count day as active for streak */
export const DAILY_MINIMUM_XP = 20;
