"use client";

import type { Character, CharacterStats, Friend, FriendRequest } from "./types";
import { xpToLevel } from "./level";

const STORAGE_KEY_REQUESTS = "campusquest_friend_requests";
const STORAGE_KEY_FRIENDS = "campusquest_friends";
const STORAGE_KEY_CHARACTERS_BY_USERNAME = "campusquest_characters_by_username";

interface FriendEntry {
  ownerId: string;
  friend: Friend;
  addedAt: number;
}

function defaultStats(): CharacterStats {
  return { strength: 0, stamina: 0, knowledge: 0, social: 0, focus: 0 };
}

function loadRequests(): FriendRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRequests(requests: FriendRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
}

function loadFriends(): FriendEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveFriends(entries: FriendEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(entries));
}

function loadCharactersByUsername(): Record<string, Character> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHARACTERS_BY_USERNAME);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCharactersByUsername(map: Record<string, Character>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CHARACTERS_BY_USERNAME, JSON.stringify(map));
}

/** Register a character so they can be found and their stats shown to friends. */
export function registerCharacter(c: Character): void {
  const map = loadCharactersByUsername();
  map[c.username.toLowerCase()] = { ...c };
  saveCharactersByUsername(map);
}

/** Get a character snapshot by username (for same-device stats). */
export function getCharacterByUsername(username: string): Character | null {
  const map = loadCharactersByUsername();
  return map[username.toLowerCase()] ?? null;
}

export function sendFriendRequest(from: Character, toUsername: string): { ok: boolean; error?: string } {
  const to = toUsername.trim().toLowerCase().replace(/\s+/g, "_");
  if (!to) return { ok: false, error: "Enter a username." };
  if (to === from.username.toLowerCase()) return { ok: false, error: "You can't add yourself." };

  const requests = loadRequests();
  const alreadyPending = requests.some(
    (r) => r.fromUserId === from.id && r.toUsername === to && r.status === "pending"
  );
  if (alreadyPending) return { ok: false, error: "Request already sent." };

  const alreadyFriends = loadFriends().some(
    (e) => e.ownerId === from.id && e.friend.username.toLowerCase() === to
  );
  if (alreadyFriends) return { ok: false, error: "Already friends." };

  const req: FriendRequest = {
    id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    fromUserId: from.id,
    fromUsername: from.username,
    fromName: from.name,
    fromAvatar: from.avatar,
    toUsername: to,
    status: "pending",
    createdAt: Date.now(),
  };
  requests.push(req);
  saveRequests(requests);
  return { ok: true };
}

export function getIncomingRequests(username: string): FriendRequest[] {
  const u = username.trim().toLowerCase();
  return loadRequests().filter((r) => r.toUsername === u && r.status === "pending");
}

export function getOutgoingRequests(userId: string): FriendRequest[] {
  return loadRequests().filter((r) => r.fromUserId === userId && r.status === "pending");
}

function characterToFriend(c: Character, addedAt: number): Friend {
  return {
    userId: c.id,
    username: c.username,
    name: c.name,
    avatar: c.avatar,
    level: c.level ?? xpToLevel(c.totalXP),
    totalXP: c.totalXP,
    stats: c.stats ?? defaultStats(),
    streakDays: c.streakDays ?? 0,
    addedAt,
  };
}

export function acceptRequest(requestId: string, currentUser: Character): void {
  const requests = loadRequests();
  const req = requests.find((r) => r.id === requestId && r.status === "pending");
  if (!req) return;

  req.status = "accepted";
  saveRequests(requests);

  const entries = loadFriends();
  const now = Date.now();

  // Sender's snapshot: from directory if same device, else from request fields with defaults
  const senderChar = getCharacterByUsername(req.fromUsername);
  const senderSnapshot: Friend = senderChar
    ? characterToFriend(senderChar, now)
    : {
        userId: req.fromUserId,
        username: req.fromUsername,
        name: req.fromName,
        avatar: req.fromAvatar,
        level: 1,
        totalXP: 0,
        stats: defaultStats(),
        streakDays: 0,
        addedAt: now,
      };
  entries.push({ ownerId: currentUser.id, friend: senderSnapshot, addedAt: now });

  // Add current user to sender's friend list (so it's mutual when they're on same device)
  const mySnapshot = characterToFriend(currentUser, now);
  entries.push({ ownerId: req.fromUserId, friend: mySnapshot, addedAt: now });

  saveFriends(entries);
}

export function declineRequest(requestId: string): void {
  const requests = loadRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return;
  req.status = "declined";
  saveRequests(requests);
}

export function getFriends(userId: string): Friend[] {
  return loadFriends()
    .filter((e) => e.ownerId === userId)
    .map((e) => e.friend)
    .sort((a, b) => b.addedAt - a.addedAt);
}

export function removeFriend(ownerId: string, friendUserId: string): void {
  const entries = loadFriends().filter(
    (e) => !(e.ownerId === ownerId && e.friend.userId === friendUserId)
  );
  saveFriends(entries);
}
