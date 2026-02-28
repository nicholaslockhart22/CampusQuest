"use client";

import type { Character, CharacterStats, ActivityLog, BossProgress as BossProgressType, CurrentBoss, UserBoss, StatKey } from "./types";
import { STAT_KEYS, MAX_STAT } from "./types";
import { xpToLevel, streakMultiplier, DAILY_MINIMUM_XP } from "./level";
import { getActivityById, isStudyActivityForBoss } from "./activities";
import { getSampleBosses } from "./bosses";
import { registerCharacter as registerCharacterInFriends } from "./friendsStore";
import { applyClassStats, type CharacterClassId } from "./characterClasses";
import { pickLootCosmetic } from "./cosmetics";
import { getSpecialQuestById } from "./specialQuests";

/** Called when a character extends their streak (so guilds can add XP). Set by guildStore. */
let onStreakExtended: ((characterId: string) => void) | null = null;
export function registerOnStreakExtended(fn: (characterId: string) => void): void {
  onStreakExtended = fn;
}

const STORAGE_KEY_CHARACTER = "campusquest_character";
const STORAGE_KEY_LOGS = "campusquest_activity_logs";
const STORAGE_KEY_BOSS_PROGRESS = "campusquest_boss_progress";
const STORAGE_KEY_CURRENT_BOSS = "campusquest_current_boss";
const STORAGE_KEY_USER_BOSSES = "campusquest_user_bosses";
const STORAGE_KEY_ACTIVE_BOSS_ID = "campusquest_active_boss_id";

const MAX_USER_BOSSES = 4;
const MIN_BOSS_HP = 250;

/** XP on defeat: 100 at 250 HP, +5 per 10 HP above 250 */
function bossXpReward(maxHp: number): number {
  const hp = Math.max(MIN_BOSS_HP, maxHp);
  return 100 + Math.floor((hp - MIN_BOSS_HP) / 10) * 5;
}

function defaultStats(): CharacterStats {
  return {
    strength: 0,
    stamina: 0,
    knowledge: 0,
    social: 0,
    focus: 0,
  };
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadCharacter(): Character | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHARACTER);
    if (!raw) return null;
    const data = JSON.parse(raw) as Character;
    data.stats = { ...defaultStats(), ...data.stats };
    data.level = xpToLevel(data.totalXP);
    if (data.streakDays == null) data.streakDays = 0;
    if (data.lastActivityDate == null) data.lastActivityDate = null;
    if (!Array.isArray(data.achievements)) data.achievements = [];
    if (!Array.isArray(data.unlockedCosmetics)) data.unlockedCosmetics = [];
    if (!data.username) data.username = (data.name || "student").toLowerCase().replace(/\s+/g, "_");
    if (data.classId == null) data.classId = undefined;
    if (data.starterWeapon == null) data.starterWeapon = undefined;
    if (!Array.isArray(data.guildIds)) {
      data.guildIds = data.guildId ? [data.guildId] : [];
      data.guildId = undefined;
    }
    return data;
  } catch {
    return null;
  }
}

function saveCharacter(c: Character): void {
  if (typeof window === "undefined") return;
  c.level = xpToLevel(c.totalXP);
  localStorage.setItem(STORAGE_KEY_CHARACTER, JSON.stringify(c));
  registerCharacterInFriends(c);
}

function loadLogs(): ActivityLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLogs(logs: ActivityLog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
}

type BossProgressRecord = Record<string, BossProgressType>;

function loadBossProgress(): BossProgressRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOSS_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveBossProgress(record: BossProgressRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_BOSS_PROGRESS, JSON.stringify(record));
}

function loadCurrentBoss(): CurrentBoss | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_BOSS);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentBoss;
  } catch {
    return null;
  }
}

function saveCurrentBoss(boss: CurrentBoss | null): void {
  if (typeof window === "undefined") return;
  if (boss === null) {
    localStorage.removeItem(STORAGE_KEY_CURRENT_BOSS);
  } else {
    localStorage.setItem(STORAGE_KEY_CURRENT_BOSS, JSON.stringify(boss));
  }
}

function loadUserBosses(): UserBoss[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_BOSSES);
    if (!raw) return [];
    const list = JSON.parse(raw) as UserBoss[];
    return list.map((b) => ({
      ...b,
      xpReward: b.xpReward ?? bossXpReward(b.maxHp),
    }));
  } catch {
    return [];
  }
}

function saveUserBosses(bosses: UserBoss[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_USER_BOSSES, JSON.stringify(bosses));
}

function loadActiveBossId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_BOSS_ID);
}

function saveActiveBossId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id === null) localStorage.removeItem(STORAGE_KEY_ACTIVE_BOSS_ID);
  else localStorage.setItem(STORAGE_KEY_ACTIVE_BOSS_ID, id);
}

function calculateXp(
  baseXp: number,
  activityId: string,
  minutes: number | undefined,
  streakDays: number
): number {
  let xp = baseXp;
  const def = getActivityById(activityId);
  if (def?.usesMinutes && minutes != null && minutes > 0) {
    xp += Math.floor(minutes / 10) * 5;
  }
  xp = Math.floor(xp * streakMultiplier(streakDays));
  return Math.max(1, xp);
}

function applyStatIncrease(
  activityId: string,
  stat: keyof CharacterStats,
  statGain: number,
  minutes: number | undefined,
  c: Character
): void {
  const def = getActivityById(activityId);
  if (def?.usesMinutes && minutes != null && minutes > 0) {
    if (stat === "knowledge") {
      c.stats.knowledge = Math.min(MAX_STAT, (c.stats.knowledge ?? 0) + Math.max(1, Math.floor(minutes / 20)));
    } else if (stat === "focus") {
      c.stats.focus = Math.min(MAX_STAT, (c.stats.focus ?? 0) + Math.max(1, Math.floor(minutes / 25)));
    } else {
      c.stats[stat] = Math.min(MAX_STAT, (c.stats[stat] ?? 0) + statGain);
    }
  } else {
    if (activityId === "gym") {
      c.stats.strength = Math.min(MAX_STAT, (c.stats.strength ?? 0) + 2);
    } else if (stat === "social" && (activityId === "club" || activityId === "group-study")) {
      c.stats.social = Math.min(MAX_STAT, (c.stats.social ?? 0) + 1);
    } else {
      c.stats[stat] = Math.min(MAX_STAT, (c.stats[stat] ?? 0) + statGain);
    }
  }
}

function ensureAchievement(c: Character, id: string): void {
  if (!c.achievements.includes(id)) c.achievements.push(id);
}

function ensureUnlockedCosmetic(c: Character, cosmeticId: string): void {
  if (!Array.isArray(c.unlockedCosmetics)) c.unlockedCosmetics = [];
  if (!c.unlockedCosmetics.includes(cosmeticId)) c.unlockedCosmetics.push(cosmeticId);
}

export function getCharacter(): Character | null {
  return loadCharacter();
}

/** Clear character from storage; next getCharacter() will return null (shows CharacterGate). */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_CHARACTER);
}

export interface CreateCharacterOptions {
  username?: string;
  classId?: CharacterClassId;
  starterWeapon?: string;
}

export function createCharacter(
  name: string,
  avatar: string,
  username?: string,
  options?: CreateCharacterOptions
): Character {
  const existing = loadCharacter();
  if (existing) return existing;

  const id = `char-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const un = (options?.username ?? username ?? name ?? "student").trim().toLowerCase().replace(/\s+/g, "_") || "student";
  const baseStats = defaultStats();
  const classId = options?.classId;
  const stats = classId ? applyClassStats(baseStats, classId) : baseStats;

  const character: Character = {
    id,
    name: name.trim() || "Student",
    username: un,
    avatar: avatar || "🎓",
    level: 1,
    totalXP: 0,
    stats,
    streakDays: 0,
    lastActivityDate: null,
    achievements: [],
    unlockedCosmetics: [],
    createdAt: Date.now(),
    classId,
    starterWeapon: options?.starterWeapon,
  };
  saveCharacter(character);
  return character;
}

export function updateCharacter(
  updates: Partial<Pick<Character, "name" | "avatar" | "username" | "classId" | "starterWeapon">>
): Character | null {
  const c = loadCharacter();
  if (!c) return null;
  if (updates.name !== undefined) c.name = updates.name.trim() || c.name;
  if (updates.avatar !== undefined) c.avatar = updates.avatar || c.avatar;
  if (updates.username !== undefined) c.username = (updates.username || c.username).toLowerCase().replace(/\s+/g, "_");
  if (updates.classId !== undefined) c.classId = updates.classId;
  if (updates.starterWeapon !== undefined) c.starterWeapon = updates.starterWeapon;
  saveCharacter(c);
  return c;
}

const MAX_GUILDS_PER_CHARACTER = 2;

/** Add character to a guild (max 2 guilds). Used by guild store. */
export function addCharacterToGuild(characterId: string, guildId: string): boolean {
  const c = loadCharacter();
  if (!c || c.id !== characterId) return false;
  const ids = c.guildIds ?? [];
  if (ids.includes(guildId)) return true;
  if (ids.length >= MAX_GUILDS_PER_CHARACTER) return false;
  c.guildIds = [...ids, guildId];
  saveCharacter(c);
  return true;
}

/** Remove character from a guild. Used by guild store. */
export function removeCharacterFromGuild(characterId: string, guildId: string): void {
  const c = loadCharacter();
  if (!c || c.id !== characterId) return;
  const ids = c.guildIds ?? [];
  c.guildIds = ids.filter((id) => id !== guildId);
  saveCharacter(c);
}

/** Prestige a stat: set it to 0 and increment its prestige count. Only allowed when stat >= MAX_STAT. */
export function prestigeStat(characterId: string, stat: StatKey): Character | null {
  const c = loadCharacter();
  if (!c || c.id !== characterId) return null;
  const value = c.stats[stat] ?? 0;
  if (value < MAX_STAT) return null;
  c.stats[stat] = 0;
  if (!c.statPrestige) c.statPrestige = {};
  c.statPrestige[stat] = (c.statPrestige[stat] ?? 0) + 1;
  saveCharacter(c);
  return c;
}

/** Claim a special quest (one-time). Requires proof; grants XP and marks quest complete. */
export function completeSpecialQuest(characterId: string, questId: string, proof: string): Character | null {
  const trimmed = typeof proof === "string" ? proof.trim() : "";
  if (!trimmed) return null;
  const c = loadCharacter();
  if (!c || c.id !== characterId) return null;
  const quest = getSpecialQuestById(questId);
  if (!quest) return null;
  const completed = c.completedSpecialQuests ?? [];
  if (completed.includes(questId)) return null;
  c.totalXP += quest.xpReward;
  c.level = xpToLevel(c.totalXP);
  c.completedSpecialQuests = [...completed, questId];
  if (!c.specialQuestProofs) c.specialQuestProofs = {};
  c.specialQuestProofs[questId] = trimmed;
  saveCharacter(c);
  return c;
}

/** Max minutes allowed per activity log (e.g. 6 hours). */
export const MAX_ACTIVITY_MINUTES = 360;

export interface LogActivityOptions {
  minutes?: number;
  proofUrl?: string;
  tags?: string[];
}

/** Spec: verify_proof — proof must be non-empty (image/link/text evidence). */
function verifyProof(proof: string | undefined): boolean {
  return typeof proof === "string" && proof.trim().length > 0;
}

export function logActivity(
  characterId: string,
  activityId: string,
  options?: LogActivityOptions
): Character | null {
  const activity = getActivityById(activityId);
  if (!activity) return null;

  if (!verifyProof(options?.proofUrl)) return null;

  const c = loadCharacter();
  if (!c || c.id !== characterId) return null;

  const baseXp = activity.baseXp ?? activity.xp;
  const rawMinutes = options?.minutes;
  const minutes =
    rawMinutes != null
      ? Math.min(MAX_ACTIVITY_MINUTES, Math.max(0, rawMinutes))
      : undefined;
  const xpEarned = calculateXp(baseXp, activityId, minutes, c.streakDays);

  const logs = loadLogs();
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    characterId,
    activityId,
    createdAt: Date.now(),
    minutes,
    proofUrl: options?.proofUrl,
    tags: options?.tags,
    xpEarned,
  };
  logs.push(log);
  saveLogs(logs);

  applyStatIncrease(activityId, activity.stat, activity.statGain, minutes, c);
  c.totalXP += xpEarned;
  const prevLevel = c.level;
  c.level = xpToLevel(c.totalXP);

  const today = todayString();
  const todayStart = new Date(today).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const todaysXp = logs
    .filter((l) => l.characterId === characterId && l.createdAt >= todayStart && l.createdAt < todayEnd && l.xpEarned != null)
    .reduce((sum, l) => sum + (l.xpEarned ?? 0), 0);

  if (todaysXp >= DAILY_MINIMUM_XP) {
    if (c.lastActivityDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
      if (c.lastActivityDate === yesterdayStr) {
        c.streakDays += 1;
        onStreakExtended?.(characterId);
      } else {
        c.streakDays = 1;
        onStreakExtended?.(characterId);
      }
      c.lastActivityDate = today;
    }
  } else {
    // Python spec: if below minimum and today > last_active_day, break streak
    if (c.lastActivityDate != null) {
      const last = c.lastActivityDate;
      if (today > last) c.streakDays = 0;
    }
  }

  ensureAchievement(c, "First Quest Completed");
  if (c.streakDays >= 7) ensureAchievement(c, "7-Day Streak");
  if (c.streakDays >= 30) ensureAchievement(c, "30-Day Streak");
  if (c.level > prevLevel) ensureAchievement(c, `Reached Level ${c.level}`);

  // Boss battles: any activity can deal damage; some types are stronger.
  applyActivityDamageToCurrentBoss(c, activityId, minutes);

  saveCharacter(c);
  return c;
}

function applyActivityDamageToCurrentBoss(c: Character, activityId: string, minutes: number | undefined): void {
  const activeId = loadActiveBossId();
  if (!activeId) return;
  const bosses = loadUserBosses();
  const boss = bosses.find((b) => b.id === activeId);
  if (!boss || boss.defeated) return;

  const def = getActivityById(activityId);
  if (!def) return;

  const statKey = def.stat;
  const statVal = (c.stats[statKey] ?? 0) as number;

  // Base damage: scaled by stat and the activity itself.
  let damage = 6 + statVal * 1.25 + def.statGain * 8;

  // Minutes-based boost for focus/knowledge blocks.
  if (def.usesMinutes && minutes != null && minutes > 0) {
    damage += Math.floor(minutes / 10) * 3;
  }

  // Study activities get extra oomph (keeps old gameplay flavor).
  if (isStudyActivityForBoss(activityId)) {
    damage += (c.stats.knowledge ?? 0) * 0.9 + (c.stats.focus ?? 0) * 0.9;
  }

  // Weakness bonus
  if (boss.weaknessStat && boss.weaknessStat === statKey) {
    damage *= 1.6;
  }

  const actualDamage = Math.max(1, Math.floor(damage));
  boss.currentHp = Math.max(0, boss.currentHp - actualDamage);

  if (boss.currentHp <= 0) {
    boss.currentHp = 0;
    boss.defeated = true;
    boss.defeatedAt = Date.now();
    const xp = boss.xpReward ?? bossXpReward(boss.maxHp);
    c.totalXP += xp;
    c.level = xpToLevel(c.totalXP);
    ensureAchievement(c, `Defeated ${boss.name} Boss (+${xp} XP)`);
    // Loot: unlock one cosmetic (if any remain locked)
    const loot = pickLootCosmetic({
      achievements: c.achievements,
      level: c.level,
      unlockedCosmetics: c.unlockedCosmetics,
    });
    if (loot) {
      boss.loot = [...(boss.loot ?? []), loot.id];
      ensureUnlockedCosmetic(c, loot.id);
      ensureAchievement(c, `Looted: ${loot.icon} ${loot.label}`);
    }
    // Remove defeated boss after rewarding XP so it disappears from the list
    const remaining = bosses.filter((b) => b.id !== boss.id);
    saveUserBosses(remaining);
    if (loadActiveBossId() === boss.id) saveActiveBossId(null);
    c.bossesDefeatedCount = (c.bossesDefeatedCount ?? 0) + 1;
    if (boss.maxHp > 500) c.finalBossesDefeatedCount = (c.finalBossesDefeatedCount ?? 0) + 1;
    return;
  }
  saveUserBosses(bosses);
}

export function getBossProgress(characterId: string): BossProgressType[] {
  const bosses = getSampleBosses();
  const progress = loadBossProgress();
  const key = `${characterId}:`;
  return bosses.map((boss) => {
    const pk = key + boss.id;
    const p = progress[pk];
    if (p) return p;
    return { bossId: boss.id, currentHp: boss.bossHp, defeated: false };
  });
}

/** User-created bosses (custom names). Study damage goes to the active one. */
export function getUserBosses(): UserBoss[] {
  return loadUserBosses();
}

/** The boss currently being attacked (study sessions deal damage to this one). */
export function getActiveBoss(): UserBoss | null {
  const id = loadActiveBossId();
  if (!id) return null;
  return loadUserBosses().find((b) => b.id === id) ?? null;
}

export function getActiveBossId(): string | null {
  return loadActiveBossId();
}

/** Set which boss receives study damage. Pass null to attack none. */
export function setActiveBossId(bossId: string | null): void {
  saveActiveBossId(bossId);
}

/** Add a new boss (custom name + HP). Max 4 bosses; min HP 250. Returns null if at limit. */
export function addUserBoss(name: string, hp: number, setAsActive = true): UserBoss | null {
  const bosses = loadUserBosses();
  if (bosses.length >= MAX_USER_BOSSES) return null;
  const maxHp = Math.max(MIN_BOSS_HP, Math.floor(hp));
  const id = `ub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const xp = bossXpReward(maxHp);
  const weakness: StatKey = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)] as StatKey;
  const boss: UserBoss = {
    id,
    name: name.trim() || "Boss",
    maxHp,
    currentHp: maxHp,
    defeated: false,
    createdAt: Date.now(),
    xpReward: xp,
    weaknessStat: weakness,
    loot: [],
  };
  bosses.push(boss);
  saveUserBosses(bosses);
  if (setAsActive) saveActiveBossId(id);
  return boss;
}

/** Remove a boss (no XP). Frees a slot. If deleted boss was active, clears active target. */
export function deleteUserBoss(bossId: string): void {
  const bosses = loadUserBosses().filter((b) => b.id !== bossId);
  saveUserBosses(bosses);
  if (loadActiveBossId() === bossId) saveActiveBossId(null);
}

export const MAX_BOSSES = MAX_USER_BOSSES;
export { MIN_BOSS_HP, bossXpReward };

/** Legacy: return active user boss in old shape for any code that still expects it. */
export function getCurrentBoss(): CurrentBoss | null {
  const b = getActiveBoss();
  if (!b) return null;
  return {
    name: b.name,
    hp: b.currentHp,
    maxHp: b.maxHp,
    active: !b.defeated,
    startedAt: b.createdAt,
  };
}

/** Legacy: add a boss and set as active (replaces old single-boss behavior). */
export function startBossBattle(name: string, hp: number): void {
  addUserBoss(name, hp, true);
}

export function getActivityLogs(characterId: string): ActivityLog[] {
  return loadLogs()
    .filter((l) => l.characterId === characterId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getStats(): CharacterStats | null {
  const c = loadCharacter();
  return c?.stats ?? null;
}

export function getLogsByActivity(characterId: string): Record<string, number> {
  const logs = loadLogs().filter((l) => l.characterId === characterId);
  const today = todayString();
  const todayStart = new Date(today).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const count: Record<string, number> = {};
  logs.forEach((l) => {
    if (l.createdAt >= todayStart && l.createdAt < todayEnd) {
      count[l.activityId] = (count[l.activityId] ?? 0) + 1;
    }
  });
  return count;
}
