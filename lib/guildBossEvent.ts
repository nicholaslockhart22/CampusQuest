"use client";

import { raidWeekKey } from "./campusBossEvent";

const STORAGE = "campusquest_guild_boss_event_v1";

const DEFAULT_MAX_HP = 150_000;

const NEMESIS_NAMES = [
  "The Syllabus Hydra",
  "Curve Crusher",
  "The Dean of Deadlines",
  "Group Project Golem",
  "Finals Fortress",
  "The Registrar Wraith",
  "Citation Kraken",
  "All-Night Lich",
];

export interface GuildBossEntry {
  name: string;
  maxHp: number;
  currentHp: number;
  /** userId -> damage dealt this week on this guild boss */
  contributions: Record<string, number>;
}

export interface GuildBossEventState {
  weekKey: string;
  byGuild: Record<string, GuildBossEntry>;
}

function nemesisNameForGuild(guildId: string): string {
  let h = 0;
  for (let i = 0; i < guildId.length; i++) h = (h * 31 + guildId.charCodeAt(i)) >>> 0;
  return NEMESIS_NAMES[h % NEMESIS_NAMES.length]!;
}

export function defaultGuildBossEntry(guildId: string): GuildBossEntry {
  return {
    name: nemesisNameForGuild(guildId),
    maxHp: DEFAULT_MAX_HP,
    currentHp: DEFAULT_MAX_HP,
    contributions: {},
  };
}

function emptyState(wk: string): GuildBossEventState {
  return { weekKey: wk, byGuild: {} };
}

export function loadGuildBossEvent(): GuildBossEventState {
  if (typeof window === "undefined") return emptyState(raidWeekKey());
  const wk = raidWeekKey();
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) {
      const s = emptyState(wk);
      localStorage.setItem(STORAGE, JSON.stringify(s));
      return s;
    }
    const s = JSON.parse(raw) as GuildBossEventState;
    if (s.weekKey !== wk) {
      const next = emptyState(wk);
      localStorage.setItem(STORAGE, JSON.stringify(next));
      return next;
    }
    if (s.byGuild == null) s.byGuild = {};
    return s;
  } catch {
    return emptyState(wk);
  }
}

function saveGuildBossEvent(s: GuildBossEventState): void {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(s));
  } catch {
    // ignore
  }
}

/** Read-only: show full-HP placeholder until the first contribution persists the row. */
export function getGuildBossDisplayEntry(guildId: string): GuildBossEntry {
  const s = loadGuildBossEvent();
  return s.byGuild[guildId] ?? defaultGuildBossEntry(guildId);
}

export function contributeGuildBossDamage(userId: string, guildId: string, damage: number): void {
  const s = loadGuildBossEvent();
  if (!s.byGuild[guildId]) {
    s.byGuild[guildId] = defaultGuildBossEntry(guildId);
  }
  const b = s.byGuild[guildId]!;
  if (b.currentHp <= 0) {
    saveGuildBossEvent(s);
    return;
  }
  const d = Math.max(0, Math.floor(damage));
  b.currentHp = Math.max(0, b.currentHp - d);
  b.contributions[userId] = (b.contributions[userId] ?? 0) + d;
  saveGuildBossEvent(s);
}

export function guildBossPercentHp(entry: GuildBossEntry): number {
  if (entry.maxHp <= 0) return 0;
  return Math.round((entry.currentHp / entry.maxHp) * 1000) / 10;
}

export function guildBossTopContributors(entry: GuildBossEntry, limit = 6): { userId: string; damage: number }[] {
  return Object.entries(entry.contributions)
    .map(([userId, damage]) => ({ userId, damage }))
    .sort((a, b) => b.damage - a.damage)
    .slice(0, limit);
}

/** Wipe striker boards for all guild bosses (on logout). Boss HP unchanged. */
export function clearGuildBossContributors(): void {
  if (typeof window === "undefined") return;
  const s = loadGuildBossEvent();
  for (const id of Object.keys(s.byGuild)) {
    const e = s.byGuild[id];
    if (e) e.contributions = {};
  }
  saveGuildBossEvent(s);
}
