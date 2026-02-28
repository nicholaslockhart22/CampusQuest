"use client";

import type { DirectMessage } from "./types";
import { getFriends } from "./friendsStore";

const STORAGE_KEY = "campusquest_dm_messages";

function loadMessages(): DirectMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMessages(messages: DirectMessage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/** Stable conversation id for two users (order-independent). */
export function getConversationId(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join("|");
}

/** Only friends can message each other. */
export function canMessage(ownerId: string, otherUserId: string): boolean {
  if (ownerId === otherUserId) return false;
  const friends = getFriends(ownerId);
  return friends.some((f) => f.userId === otherUserId);
}

/** Get all messages for a conversation, sorted by time. */
export function getMessages(conversationId: string): DirectMessage[] {
  return loadMessages()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Send a direct message. Fails if sender and recipient are not friends.
 * Returns the new message or null if not allowed.
 */
export function sendMessage(
  fromUserId: string,
  toUserId: string,
  text: string
): DirectMessage | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (!canMessage(fromUserId, toUserId)) return null;

  const conversationId = getConversationId(fromUserId, toUserId);
  const msg: DirectMessage = {
    id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    conversationId,
    fromUserId,
    toUserId,
    text: trimmed.slice(0, 2000),
    createdAt: Date.now(),
  };
  const messages = loadMessages();
  messages.push(msg);
  saveMessages(messages);
  return msg;
}

/** Summary of a conversation for list view. */
export interface ConversationSummary {
  conversationId: string;
  otherUserId: string;
  otherUsername: string;
  otherName: string;
  otherAvatar: string;
  lastMessage: string;
  lastAt: number;
  unreadCount?: number;
}

/** Get all conversations for a user, sorted by last message time (newest first). */
export function getConversationsForUser(userId: string): ConversationSummary[] {
  const friends = getFriends(userId);
  const friendIds = new Set(friends.map((f) => f.userId));
  const messages = loadMessages();
  const byConversation = new Map<
    string,
    { last: DirectMessage; otherUserId: string }
  >();

  for (const m of messages) {
    if (m.fromUserId !== userId && m.toUserId !== userId) continue;
    const other = m.fromUserId === userId ? m.toUserId : m.fromUserId;
    if (!friendIds.has(other)) continue;
    const cid = getConversationId(userId, other);
    const existing = byConversation.get(cid);
    if (!existing || m.createdAt > existing.last.createdAt) {
      byConversation.set(cid, { last: m, otherUserId: other });
    }
  }

  const friendsByUserId = new Map(friends.map((f) => [f.userId, f]));
  const summaries: ConversationSummary[] = [];
  byConversation.forEach(({ last, otherUserId }, conversationId) => {
    const friend = friendsByUserId.get(otherUserId);
    if (!friend) return;
    summaries.push({
      conversationId,
      otherUserId,
      otherUsername: friend.username,
      otherName: friend.name,
      otherAvatar: friend.avatar,
      lastMessage: last.text,
      lastAt: last.createdAt,
    });
  });
  summaries.sort((a, b) => b.lastAt - a.lastAt);
  return summaries;
}
