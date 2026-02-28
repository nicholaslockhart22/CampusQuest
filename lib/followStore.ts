"use client";

const STORAGE_KEY_FOLLOWING = "campusquest_following";

/** Map: ownerId -> array of followed user IDs (people whose posts the owner sees on The Quad). */
function loadFollowing(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLLOWING);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveFollowing(data: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_FOLLOWING, JSON.stringify(data));
}

/** Get user IDs that this user follows (one-way; their posts show on The Quad). */
export function getFollowing(ownerId: string): string[] {
  const data = loadFollowing();
  return data[ownerId] ?? [];
}

/** Follow someone so their posts appear on your Quad feed. One-way; does not make you friends. */
export function follow(ownerId: string, targetUserId: string): boolean {
  if (ownerId === targetUserId) return false;
  const data = loadFollowing();
  const list = data[ownerId] ?? [];
  if (list.includes(targetUserId)) return true;
  data[ownerId] = [...list, targetUserId];
  saveFollowing(data);
  return true;
}

/** Unfollow; you will no longer see their posts on The Quad. Does not remove friendship. */
export function unfollow(ownerId: string, targetUserId: string): void {
  const data = loadFollowing();
  const list = data[ownerId] ?? [];
  data[ownerId] = list.filter((id) => id !== targetUserId);
  saveFollowing(data);
}

export function isFollowing(ownerId: string, targetUserId: string): boolean {
  return getFollowing(ownerId).includes(targetUserId);
}

/** Follow by username (looks up user on this device). Returns error message or null on success. */
export function followByUsername(
  currentUserId: string,
  username: string,
  getCharacterByUsername: (username: string) => { id: string } | null
): string | null {
  const u = username.trim().toLowerCase().replace(/\s+/g, "_");
  if (!u) return "Enter a username.";
  const target = getCharacterByUsername(u);
  if (!target) return "User not found.";
  follow(currentUserId, target.id);
  return null;
}
