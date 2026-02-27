"use client";

import type { Guild, GuildInviteRequest, GuildInterest } from "./types";
import { setCharacterGuild } from "./store";

const STORAGE_KEY_GUILDS = "campusquest_guilds";
const STORAGE_KEY_GUILD_INVITES = "campusquest_guild_invites";

const SAMPLE_GUILDS: Guild[] = [
  { id: "g-study-1", name: "Library Legends", crest: "📚", level: 4, memberIds: [], weeklyQuestGoal: "Log 20 study sessions as a guild", interest: "study", createdAt: Date.now() - 86400000 * 14, createdByUserId: "" },
  { id: "g-study-2", name: "All-Nighter Squad", crest: "☕", level: 2, memberIds: [], weeklyQuestGoal: "10 group study activities", interest: "study", createdAt: Date.now() - 86400000 * 7, createdByUserId: "" },
  { id: "g-fitness-1", name: "Ram Runners", crest: "🦌", level: 5, memberIds: [], weeklyQuestGoal: "30 gym or run logs combined", interest: "fitness", createdAt: Date.now() - 86400000 * 21, createdByUserId: "" },
  { id: "g-fitness-2", name: "Keaney Fit", crest: "💪", level: 3, memberIds: [], weeklyQuestGoal: "Every member logs 1 workout", interest: "fitness", createdAt: Date.now() - 86400000 * 10, createdByUserId: "" },
  { id: "g-networking-1", name: "Career Quest", crest: "💼", level: 3, memberIds: [], weeklyQuestGoal: "Attend 1 career event (any member)", interest: "networking", createdAt: Date.now() - 86400000 * 5, createdByUserId: "" },
  { id: "g-networking-2", name: "LinkedIn Rams", crest: "🔗", level: 2, memberIds: [], weeklyQuestGoal: "5 networking activities", interest: "networking", createdAt: Date.now() - 86400000 * 3, createdByUserId: "" },
  { id: "g-clubs-1", name: "Quad Squad", crest: "🎸", level: 6, memberIds: [], weeklyQuestGoal: "12 club or social activities", interest: "clubs", createdAt: Date.now() - 86400000 * 30, createdByUserId: "" },
  { id: "g-clubs-2", name: "Campus Crew", crest: "🌟", level: 4, memberIds: [], weeklyQuestGoal: "Everyone posts 1 Field Note", interest: "clubs", createdAt: Date.now() - 86400000 * 12, createdByUserId: "" },
];

function loadGuilds(): Guild[] {
  if (typeof window === "undefined") return [...SAMPLE_GUILDS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUILDS);
    if (!raw) {
      saveGuilds(SAMPLE_GUILDS);
      return [...SAMPLE_GUILDS];
    }
    return JSON.parse(raw);
  } catch {
    return [...SAMPLE_GUILDS];
  }
}

function saveGuilds(guilds: Guild[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_GUILDS, JSON.stringify(guilds));
}

function loadInviteRequests(): GuildInviteRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUILD_INVITES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveInviteRequests(requests: GuildInviteRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_GUILD_INVITES, JSON.stringify(requests));
}

export const GUILD_INTEREST_LABELS: Record<GuildInterest, string> = {
  study: "Study",
  fitness: "Fitness",
  networking: "Networking",
  clubs: "Clubs",
};

export const GUILD_INTEREST_ICONS: Record<GuildInterest, string> = {
  study: "📚",
  fitness: "💪",
  networking: "💼",
  clubs: "🌟",
};

export function getGuilds(): Guild[] {
  return loadGuilds();
}

export function getGuildById(id: string): Guild | undefined {
  return loadGuilds().find((g) => g.id === id);
}

export function getRecommendedGuilds(interest?: GuildInterest): Guild[] {
  const guilds = loadGuilds();
  if (interest) return guilds.filter((g) => g.interest === interest).sort((a, b) => b.level - a.level);
  return [...guilds].sort((a, b) => b.level - a.level);
}

export function createGuild(params: {
  name: string;
  crest: string;
  weeklyQuestGoal: string;
  interest: GuildInterest;
  createdByUserId: string;
}): Guild | null {
  const name = params.name.trim().slice(0, 40);
  if (!name) return null;
  const guilds = loadGuilds();
  const id = `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const guild: Guild = {
    id,
    name,
    crest: params.crest || "🛡️",
    level: 1,
    memberIds: [params.createdByUserId],
    weeklyQuestGoal: params.weeklyQuestGoal.trim().slice(0, 80) || "Complete activities together",
    interest: params.interest,
    createdAt: Date.now(),
    createdByUserId: params.createdByUserId,
  };
  guilds.push(guild);
  saveGuilds(guilds);
  setCharacterGuild(params.createdByUserId, id);
  return guild;
}

export function joinGuild(characterId: string, guildId: string): boolean {
  const guilds = loadGuilds();
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild || guild.memberIds.includes(characterId)) return false;
  leaveGuild(characterId);
  guild.memberIds.push(characterId);
  saveGuilds(guilds);
  setCharacterGuild(characterId, guildId);
  return true;
}

export function leaveGuild(characterId: string): void {
  const guilds = loadGuilds();
  const guild = guilds.find((g) => g.memberIds.includes(characterId));
  if (guild) {
    guild.memberIds = guild.memberIds.filter((id) => id !== characterId);
    saveGuilds(guilds);
  }
  setCharacterGuild(characterId, null);
}

export function requestGuildInvite(characterId: string, guildId: string): GuildInviteRequest | null {
  const guild = getGuildById(guildId);
  if (!guild) return null;
  const requests = loadInviteRequests();
  if (requests.some((r) => r.guildId === guildId && r.userId === characterId && r.status === "pending")) return null;
  const req: GuildInviteRequest = {
    id: `gir-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    guildId,
    userId: characterId,
    status: "pending",
    createdAt: Date.now(),
  };
  requests.push(req);
  saveInviteRequests(requests);
  return req;
}

export function getPendingInviteRequestsForUser(characterId: string): GuildInviteRequest[] {
  return loadInviteRequests().filter((r) => r.userId === characterId && r.status === "pending");
}

export function getPendingInviteRequestsForGuild(guildId: string): GuildInviteRequest[] {
  return loadInviteRequests().filter((r) => r.guildId === guildId && r.status === "pending");
}

export function hasRequestedInvite(characterId: string, guildId: string): boolean {
  return loadInviteRequests().some((r) => r.userId === characterId && r.guildId === guildId && r.status === "pending");
}
