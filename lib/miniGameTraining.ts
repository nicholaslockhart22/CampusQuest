"use client";

import type { Character, MiniGameTrainingPersist, StatKey } from "./types";
import { STAT_KEYS } from "./types";
import { todayString, yesterdayString, isoWeekKey } from "./dateUtils";

export const MINI_GAME_MAX_PLAYS_PER_DAY = 2;
export const MINI_GAME_DAILY_QUOTA_BONUS_XP = 22;
export const MINI_GAME_WEEK_ALL_FIVE_BONUS_XP = 50;

/** Streak applies to the base session XP before daily/weekly bonuses */
export function streakMultiplierForTraining(streak: number): number {
  return 1 + Math.min(0.15, Math.max(0, streak) * 0.02);
}

export function ensureMiniGameTrainingRollover(c: Character): MiniGameTrainingPersist {
  const today = todayString();
  const wk = isoWeekKey();
  let m = c.miniGameTraining;
  if (!m) {
    m = {
      day: today,
      playsUsed: 0,
      statsTrainedToday: [],
      dailyQuotaBonusClaimed: false,
      weekKey: wk,
      weekStatsTrained: [],
      weekAllFiveBonusClaimed: false,
      fullTrainingStreak: 0,
      lastFullTrainingDay: null,
    };
    c.miniGameTraining = m;
    return m;
  }
  if (m.weekKey !== wk) {
    m.weekKey = wk;
    m.weekStatsTrained = [];
    m.weekAllFiveBonusClaimed = false;
  }
  if (m.day !== today) {
    m.day = today;
    m.playsUsed = 0;
    m.statsTrainedToday = [];
    m.dailyQuotaBonusClaimed = false;
  }
  c.miniGameTraining = m;
  return m;
}

export function canPlayMiniGameTraining(c: Character): boolean {
  ensureMiniGameTrainingRollover(c);
  return (c.miniGameTraining?.playsUsed ?? 0) < MINI_GAME_MAX_PLAYS_PER_DAY;
}

export function playsRemainingToday(c: Character): number {
  ensureMiniGameTrainingRollover(c);
  return Math.max(0, MINI_GAME_MAX_PLAYS_PER_DAY - (c.miniGameTraining?.playsUsed ?? 0));
}

export function getMiniGameTrainingSummary(c: Character) {
  ensureMiniGameTrainingRollover(c);
  const m = c.miniGameTraining!;
  return {
    playsLeft: Math.max(0, MINI_GAME_MAX_PLAYS_PER_DAY - m.playsUsed),
    streak: m.fullTrainingStreak,
    weekStats: [...m.weekStatsTrained] as StatKey[],
    weekRingComplete: STAT_KEYS.every((s) => m.weekStatsTrained.includes(s)),
    weekBonusClaimed: m.weekAllFiveBonusClaimed,
    streakMult: streakMultiplierForTraining(m.fullTrainingStreak),
  };
}
