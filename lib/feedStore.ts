"use client";

import type { FieldNote, RamMark, FieldNoteSerialized, QuadComment, QuadPostVisibility } from "./types";
import { getFriends } from "./friendsStore";
import { addXpToCharacter, bumpQuadAssistForAuthor, getGuildIdsForCharacter } from "./store";
import { recordGuildWeeklyRace } from "./guildWeeklyRace";
import { FIELD_NOTE_MAX_CHARS, RAMMARK_MAX_LENGTH, RAMMARK_MAX_PER_POST, QUAD_COMMENT_MAX_CHARS } from "./types";

let feed: FieldNote[] = [];
let comments: QuadComment[] = [];

const BASE_TS = Date.now();

function seedNote(
  authorId: string,
  authorName: string,
  authorUsername: string,
  authorAvatar: string,
  body: string,
  ramMarks: { tag: string }[],
  hoursAgo: number,
  nodCount = 0,
  hypeSeed = 0,
  authorStreakDays = 0
): FieldNote {
  const id = `fn-seed-${authorId}`;
  const ramMarksWithIds: RamMark[] = ramMarks.map((r) => ({ id: `rm-${id}-${r.tag}`, tag: r.tag.toLowerCase() }));
  return {
    id,
    authorId,
    authorName,
    authorUsername,
    authorAvatar,
    body,
    ramMarks: ramMarksWithIds,
    nodCount,
    vouchCount: hypeSeed,
    nodByUserIds: new Set(),
    vouchByUserIds: new Set(),
    hypeCount: hypeSeed,
    verifyCount: Math.min(3, Math.floor(hypeSeed / 2)),
    assistCount: Math.min(4, Math.floor(hypeSeed / 3)),
    hypeByUserIds: new Set(),
    verifyByUserIds: new Set(),
    assistByUserIds: new Set(),
    createdAt: BASE_TS - hoursAgo * 60 * 60 * 1000,
    visibility: "public",
    authorStreakDays: authorStreakDays || (hypeSeed > 2 ? 7 : 3),
  };
}

const SEED_FIELD_NOTES: FieldNote[] = [
  seedNote("seed-1", "Jordan Kim", "jordan_kim", "📚", "Just finished a 2-hour study session at the library. That calc problem set was no joke but we got through it. #studysesh #library", [{ tag: "studysesh" }, { tag: "library" }], 1, 3, 8),
  seedNote("seed-2", "Alex Rivera", "alex_rivera", "💪", "Morning lift at the rec center. New PR on bench! #gym #ramnation", [{ tag: "gym" }, { tag: "ramnation" }], 3, 5, 12),
  seedNote("seed-3", "Casey Lee", "casey_lee", "☕", "Coffee + flashcards at the union. Midterms are coming but we're ready. #study #coffee", [{ tag: "study" }, { tag: "coffee" }], 5, 2, 0),
  seedNote("seed-4", "Riley Morgan", "riley_morgan", "🏃", "5K run around campus before class. Nothing like fresh air to wake you up. #running #campus", [{ tag: "running" }, { tag: "campus" }], 8, 4, 5),
  seedNote("seed-5", "Quinn Taylor", "quinn_taylor", "📖", "Group study for orgo in the science building. Shoutout to the squad for explaining mechanisms. #groupstudy #orgo", [{ tag: "groupstudy" }, { tag: "orgo" }], 12, 6, 14),
  seedNote("seed-6", "Avery Jones", "avery_jones", "🎯", "Deep focus block: 90 minutes no phone. Finished my essay draft. #focus #productivity", [{ tag: "focus" }, { tag: "productivity" }], 18, 2, 21),
  seedNote("seed-7", "Morgan Blake", "morgan_blake", "💼", "Went to the career fair today. So many companies! Dropped my resume at 4 booths. #networking #career", [{ tag: "networking" }, { tag: "career" }], 24, 8, 4),
  seedNote("seed-8", "Sam Chen", "sam_chen", "🦌", "Ram Run event was a blast. 200+ people showed up. URI spirit is real. #ramrun #uri", [{ tag: "ramrun" }, { tag: "uri" }], 36, 12, 30),
  seedNote("seed-9", "Jamie Foster", "jamie_foster", "🌟", "Club meeting tonight — we're planning the spring concert. So much to do but the team is amazing. #clublife #campus", [{ tag: "clublife" }, { tag: "campus" }], 48, 1, 2),
  seedNote("seed-10", "Drew Patel", "drew_patel", "🎸", "Practiced for the open mic at the pub. Nerves are real but so is the excitement. #music #campuslife", [{ tag: "music" }, { tag: "campuslife" }], 60, 7, 6),
];

function migrateNote(n: FieldNote): FieldNote {
  const any = n as FieldNote & { hypeByUserIds?: Set<string> };
  if (!any.hypeByUserIds) {
    any.hypeByUserIds = new Set(n.vouchByUserIds);
    any.hypeCount = n.vouchCount;
    any.verifyByUserIds = new Set();
    any.verifyCount = 0;
    any.assistByUserIds = new Set();
    any.assistCount = 0;
  }
  return any;
}

export function normalizeRamMarkTag(tag: string): string {
  return tag
    .replace(/^#+\s*/, "")
    .trim()
    .slice(0, RAMMARK_MAX_LENGTH)
    .toLowerCase();
}

export function parseRamMarksFromText(text: string): RamMark[] {
  const seen = new Set<string>();
  const re = /#([\w]{1,15})/gi;
  const matches = text.match(re) ?? [];
  const list: RamMark[] = [];
  for (const m of matches) {
    const tag = normalizeRamMarkTag(m);
    if (tag && !seen.has(tag) && list.length < RAMMARK_MAX_PER_POST) {
      seen.add(tag);
      list.push({ id: `rm-${Date.now()}-${tag}`, tag });
    }
  }
  return list;
}

export type QuadFeedType = "public" | "friends";

export function getFeed(viewerId: string | undefined, feedType: QuadFeedType): FieldNote[] {
  if (viewerId == null) return [];
  let list: FieldNote[];
  if (feedType === "public") {
    list = feed.filter((n) => (n.visibility ?? "public") === "public").map(migrateNote);
    const listIds = new Set(list.map((n) => n.id));
    SEED_FIELD_NOTES.forEach((n) => {
      if (!listIds.has(n.id)) {
        list.push(n);
        listIds.add(n.id);
      }
    });
  } else {
    const friendIds = new Set(getFriends(viewerId).map((f) => f.userId));
    list = feed
      .filter((n) => n.visibility === "friends" && (n.authorId === viewerId || friendIds.has(n.authorId)))
      .map(migrateNote);
  }
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export function getFeedByAuthorId(authorId: string): FieldNote[] {
  return [...feed]
    .filter((n) => n.authorId === authorId)
    .map(migrateNote)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export interface CreateFieldNoteParams {
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  body: string;
  ramMarks: RamMark[];
  proofUrl?: string;
  visibility?: QuadPostVisibility;
  authorStreakDays?: number;
}

export function createFieldNote(params: CreateFieldNoteParams): FieldNote | null {
  const body = params.body.trim().slice(0, FIELD_NOTE_MAX_CHARS);
  if (!body) return null;

  const ramMarks = params.ramMarks
    .slice(0, RAMMARK_MAX_PER_POST)
    .map((r) => ({
      ...r,
      tag: normalizeRamMarkTag(r.tag).slice(0, RAMMARK_MAX_LENGTH),
    }))
    .filter((r) => r.tag);

  const note: FieldNote = {
    id: `fn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    authorId: params.authorId,
    authorName: params.authorName,
    authorUsername: params.authorUsername,
    authorAvatar: params.authorAvatar,
    body,
    ramMarks,
    nodCount: 0,
    vouchCount: 0,
    nodByUserIds: new Set(),
    vouchByUserIds: new Set(),
    hypeCount: 0,
    verifyCount: 0,
    assistCount: 0,
    hypeByUserIds: new Set(),
    verifyByUserIds: new Set(),
    assistByUserIds: new Set(),
    createdAt: Date.now(),
    proofUrl: params.proofUrl,
    visibility: params.visibility ?? "public",
    authorStreakDays: params.authorStreakDays,
  };
  feed.unshift(note);
  return note;
}

export function nodFieldNote(noteId: string, userId: string): FieldNote | null {
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;
  migrateNote(note);
  if (note.nodByUserIds.has(userId)) {
    note.nodByUserIds.delete(userId);
    note.nodCount = note.nodByUserIds.size;
  } else {
    note.nodByUserIds.add(userId);
    note.nodCount = note.nodByUserIds.size;
  }
  return note;
}

export function hypeFieldNote(noteId: string, userId: string): FieldNote | null {
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;
  migrateNote(note);
  if (note.hypeByUserIds.has(userId)) {
    note.hypeByUserIds.delete(userId);
    note.hypeCount = note.hypeByUserIds.size;
    note.vouchByUserIds = note.hypeByUserIds;
    note.vouchCount = note.hypeCount;
  } else {
    note.hypeByUserIds.add(userId);
    note.hypeCount = note.hypeByUserIds.size;
    note.vouchByUserIds = note.hypeByUserIds;
    note.vouchCount = note.hypeCount;
    addXpToCharacter(userId, 2);
    addXpToCharacter(note.authorId, 3);
  }
  return note;
}

/** @deprecated Use hypeFieldNote */
export function vouchFieldNote(noteId: string, userId: string): FieldNote | null {
  return hypeFieldNote(noteId, userId);
}

export function verifyFieldNote(noteId: string, userId: string): FieldNote | null {
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;
  migrateNote(note);
  if (note.verifyByUserIds.has(userId)) {
    note.verifyByUserIds.delete(userId);
    note.verifyCount = note.verifyByUserIds.size;
  } else {
    note.verifyByUserIds.add(userId);
    note.verifyCount = note.verifyByUserIds.size;
    addXpToCharacter(userId, 5);
    addXpToCharacter(note.authorId, 5);
  }
  return note;
}

export function assistFieldNote(noteId: string, userId: string): FieldNote | null {
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;
  migrateNote(note);
  if (note.assistByUserIds.has(userId)) {
    note.assistByUserIds.delete(userId);
    note.assistCount = note.assistByUserIds.size;
  } else {
    note.assistByUserIds.add(userId);
    note.assistCount = note.assistByUserIds.size;
    addXpToCharacter(note.authorId, 2);
    bumpQuadAssistForAuthor(note.authorId);
    const guildIds = getGuildIdsForCharacter(userId);
    recordGuildWeeklyRace(userId, guildIds, 8);
  }
  return note;
}

export function getAllRamMarks(): string[] {
  const set = new Set<string>();
  feed.forEach((n) => n.ramMarks.forEach((r) => set.add(r.tag)));
  SEED_FIELD_NOTES.forEach((n) => n.ramMarks.forEach((r) => set.add(r.tag)));
  return Array.from(set).sort();
}

export function getCommentsByNoteId(noteId: string): QuadComment[] {
  return [...comments]
    .filter((c) => c.noteId === noteId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export interface AddCommentParams {
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  body: string;
}

export function addComment(noteId: string, params: AddCommentParams): QuadComment | null {
  const body = params.body.trim().slice(0, QUAD_COMMENT_MAX_CHARS);
  if (!body) return null;
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;

  const comment: QuadComment = {
    id: `qc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    noteId,
    authorId: params.authorId,
    authorName: params.authorName,
    authorUsername: params.authorUsername,
    authorAvatar: params.authorAvatar,
    body,
    createdAt: Date.now(),
  };
  comments.push(comment);
  return comment;
}
