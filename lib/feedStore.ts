"use client";

import type { FieldNote, RamMark, FieldNoteSerialized, QuadComment } from "./types";
import { FIELD_NOTE_MAX_CHARS, RAMMARK_MAX_LENGTH, RAMMARK_MAX_PER_POST, QUAD_COMMENT_MAX_CHARS } from "./types";

// In-memory feed (resets on refresh for MVP). Character-backed; author comes from store.
let feed: FieldNote[] = [];
let comments: QuadComment[] = [];

function serialize(note: FieldNote): FieldNoteSerialized {
  return {
    ...note,
    nodByUserIds: Array.from(note.nodByUserIds),
    rallyByUserIds: Array.from(note.rallyByUserIds),
  };
}

function deserialize(raw: FieldNoteSerialized): FieldNote {
  return {
    ...raw,
    nodByUserIds: new Set(raw.nodByUserIds),
    rallyByUserIds: new Set(raw.rallyByUserIds),
  };
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

export function getFeed(filterRamMark?: string): FieldNote[] {
  let list = [...feed].sort((a, b) => b.createdAt - a.createdAt);
  if (filterRamMark) {
    const tag = filterRamMark.toLowerCase();
    list = list.filter((n) => n.ramMarks.some((r) => r.tag === tag));
  }
  return list;
}

export function getFeedByAuthorId(authorId: string): FieldNote[] {
  return [...feed]
    .filter((n) => n.authorId === authorId)
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
}

export function createFieldNote(params: CreateFieldNoteParams): FieldNote | null {
  const body = params.body.trim().slice(0, FIELD_NOTE_MAX_CHARS);
  if (!body) return null;

  const ramMarks = params.ramMarks.slice(0, RAMMARK_MAX_PER_POST).map((r) => ({
    ...r,
    tag: normalizeRamMarkTag(r.tag).slice(0, RAMMARK_MAX_LENGTH),
  })).filter((r) => r.tag);

  const note: FieldNote = {
    id: `fn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    authorId: params.authorId,
    authorName: params.authorName,
    authorUsername: params.authorUsername,
    authorAvatar: params.authorAvatar,
    body,
    ramMarks,
    nodCount: 0,
    rallyCount: 0,
    nodByUserIds: new Set(),
    rallyByUserIds: new Set(),
    createdAt: Date.now(),
    proofUrl: params.proofUrl,
  };
  feed.unshift(note);
  return note;
}

export function nodFieldNote(noteId: string, userId: string): FieldNote | null {
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;
  if (note.nodByUserIds.has(userId)) {
    note.nodByUserIds.delete(userId);
    note.nodCount = note.nodByUserIds.size;
  } else {
    note.nodByUserIds.add(userId);
    note.nodCount = note.nodByUserIds.size;
  }
  return note;
}

export function rallyFieldNote(noteId: string, userId: string): FieldNote | null {
  const note = feed.find((n) => n.id === noteId);
  if (!note) return null;
  if (note.rallyByUserIds.has(userId)) {
    note.rallyByUserIds.delete(userId);
    note.rallyCount = note.rallyByUserIds.size;
  } else {
    note.rallyByUserIds.add(userId);
    note.rallyCount = note.rallyByUserIds.size;
  }
  return note;
}

export function getAllRamMarks(): string[] {
  const set = new Set<string>();
  feed.forEach((n) => n.ramMarks.forEach((r) => set.add(r.tag)));
  return Array.from(set).sort();
}

// —— Comments on Quad posts ——

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
