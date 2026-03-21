"use client";

const STORAGE = "campusquest_campus_boss_event";

export interface CampusBossEventState {
  weekKey: string;
  name: string;
  maxHp: number;
  currentHp: number;
  /** userId -> damage dealt this week */
  contributions: Record<string, number>;
}

/** UTC Monday date (YYYY-MM-DD) — campus raid, guild battle, and weekly resets align on this key. */
export function raidWeekKey(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  if (day !== 1) t.setUTCDate(t.getUTCDate() - (day - 1));
  return t.toISOString().slice(0, 10);
}

function weekKey(d = new Date()): string {
  return raidWeekKey(d);
}

function defaultState(wk: string): CampusBossEventState {
  return {
    weekKey: wk,
    name: "Midterm Week: The Overload",
    maxHp: 500_000,
    currentHp: 500_000,
    contributions: {},
  };
}

export function loadCampusBossEvent(): CampusBossEventState {
  if (typeof window === "undefined") return defaultState(weekKey());
  try {
    const raw = localStorage.getItem(STORAGE);
    const wk = weekKey();
    if (!raw) {
      const s = defaultState(wk);
      localStorage.setItem(STORAGE, JSON.stringify(s));
      return s;
    }
    const s = JSON.parse(raw) as CampusBossEventState;
    if (s.weekKey !== wk) {
      const next = defaultState(wk);
      localStorage.setItem(STORAGE, JSON.stringify(next));
      return next;
    }
    if (s.contributions == null) s.contributions = {};
    return s;
  } catch {
    return defaultState(weekKey());
  }
}

export function contributeCampusBossDamage(userId: string, damage: number): CampusBossEventState {
  const s = loadCampusBossEvent();
  if (s.currentHp <= 0) return s;
  const d = Math.max(0, Math.floor(damage));
  s.currentHp = Math.max(0, s.currentHp - d);
  s.contributions[userId] = (s.contributions[userId] ?? 0) + d;
  try {
    localStorage.setItem(STORAGE, JSON.stringify(s));
  } catch {
    // ignore
  }
  return s;
}

export function campusBossPercentHp(state: CampusBossEventState): number {
  if (state.maxHp <= 0) return 0;
  return Math.round((state.currentHp / state.maxHp) * 1000) / 10;
}

export function topContributors(state: CampusBossEventState, limit = 8): { userId: string; damage: number }[] {
  return Object.entries(state.contributions)
    .map(([userId, damage]) => ({ userId, damage }))
    .sort((a, b) => b.damage - a.damage)
    .slice(0, limit);
}
