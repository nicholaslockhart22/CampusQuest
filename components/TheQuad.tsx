"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getFeed,
  nodFieldNote,
  hypeFieldNote,
  verifyFieldNote,
  assistFieldNote,
  getCommentsByNoteId,
  addComment,
  type QuadFeedType,
} from "@/lib/feedStore";
import { getFriends, getCharacterById } from "@/lib/friendsStore";
import type { FieldNote, Character } from "@/lib/types";
import { FieldNoteComposer } from "@/components/FieldNoteComposer";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { AvatarDisplay } from "@/components/AvatarDisplay";

function enrichNote(note: FieldNote): FieldNote {
  if (note.authorStreakDays != null) return note;
  const snap = getCharacterById(note.authorId);
  if (snap?.streakDays != null) {
    return { ...note, authorStreakDays: snap.streakDays };
  }
  return note;
}

export function TheQuad({
  character,
  onRefresh,
}: {
  character: Character;
  onRefresh?: () => void;
}) {
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [feedType, setFeedType] = useState<QuadFeedType>("public");
  const [composerOpen, setComposerOpen] = useState(false);
  const [boardTick, setBoardTick] = useState(0);

  const refresh = useCallback(() => {
    setNotes(getFeed(character.id, feedType).map(enrichNote));
    setBoardTick((t) => t + 1);
    onRefresh?.();
  }, [character.id, feedType, onRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleNod(noteId: string) {
    nodFieldNote(noteId, character.id);
    refresh();
  }

  function handleHype(noteId: string) {
    hypeFieldNote(noteId, character.id);
    refresh();
    onRefresh?.();
  }

  function handleVerify(noteId: string) {
    verifyFieldNote(noteId, character.id);
    refresh();
    onRefresh?.();
  }

  function handleAssist(noteId: string) {
    assistFieldNote(noteId, character.id);
    refresh();
    onRefresh?.();
  }

  function handleAddComment(noteId: string, body: string) {
    addComment(noteId, {
      authorId: character.id,
      authorName: character.name,
      authorUsername: character.username,
      authorAvatar: character.avatar,
      body,
    });
    refresh();
  }

  const topRams = useMemo(() => {
    void boardTick;
    const friends = getFriends(character.id);
    const rows: { id: string; name: string; avatar: string; xp: number; level: number }[] = [
      {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        xp: character.totalXP,
        level: character.level,
      },
    ];
    for (const f of friends) {
      if (f.userId === character.id) continue;
      rows.push({
        id: f.userId,
        name: f.name,
        avatar: f.avatar,
        xp: f.totalXP,
        level: f.level,
      });
    }
    return rows.sort((a, b) => b.xp - a.xp).slice(0, 4);
  }, [character, boardTick]);

  const feedHint =
    feedType === "public"
      ? "Everyone on CampusQuest can see public Field Notes."
      : "Only you and your friends see posts in this feed.";

  return (
    <section
      className="overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_1px_0_0_rgba(104,171,232,0.12),0_8px_32px_-8px_rgba(0,0,0,0.45)] sm:rounded-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(4, 30, 66, 0.98) 0%, rgba(3, 22, 48, 0.96) 100%)",
      }}
    >
      <div
        className="border-b border-white/[0.08] px-3 py-4 sm:px-5 sm:py-5"
        style={{
          background: "linear-gradient(165deg, rgba(104, 171, 232, 0.16) 0%, rgba(4, 30, 66, 0.95) 42%, rgba(4, 30, 66, 0.99) 100%)",
          boxShadow: "0 1px 0 0 rgba(104, 171, 232, 0.12)",
        }}
      >
        <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-uri-keaney/45 bg-gradient-to-br from-uri-keaney/30 to-uri-navy/90 text-2xl shadow-[0_0_20px_rgba(104,171,232,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-14 sm:w-14 sm:text-3xl">
            <span className="leading-none" aria-hidden>
              📋
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="font-display text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">The Quad</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-[13px] sm:text-white/55">
              Field Notes from Rams — hype, verify, and cheer each other on.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-uri-gold/35 bg-gradient-to-br from-uri-gold/[0.12] via-uri-gold/[0.04] to-transparent p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:mb-5 sm:p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-sm" aria-hidden>
              🏆
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-uri-gold/95 sm:text-xs">Weekly spotlight</span>
            <span className="text-[10px] text-white/40">· your circle by XP</span>
          </div>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {topRams.map((r, i) => (
              <div
                key={r.id}
                className="flex min-w-[9.5rem] shrink-0 snap-start items-center gap-2.5 rounded-xl border border-white/12 bg-black/25 px-3 py-2 shadow-inner sm:min-w-0"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-uri-gold/20 font-mono text-[11px] font-bold text-uri-gold">
                  {i + 1}
                </span>
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/10">
                  <AvatarDisplay avatar={r.avatar} size={36} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{r.name}</div>
                  <div className="text-[11px] text-white/50">
                    Lv.{r.level} · <span className="font-mono text-uri-keaney/90">{r.xp.toLocaleString()}</span> XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-1 shadow-inner">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setFeedType("public")}
              className={`rounded-xl px-2 py-3 text-center transition-all duration-200 sm:flex sm:items-center sm:justify-center sm:gap-2 sm:py-3 sm:pl-3 sm:pr-4 ${
                feedType === "public"
                  ? "bg-gradient-to-b from-uri-keaney/45 to-uri-keaney/20 text-white shadow-[0_0_24px_rgba(104,171,232,0.2)] ring-1 ring-uri-keaney/50"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/85"
              }`}
            >
              <span className="text-xl leading-none sm:text-lg" aria-hidden>
                🌐
              </span>
              <span className="mt-1 block text-xs font-bold sm:mt-0 sm:text-sm">Public</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedType("friends")}
              className={`rounded-xl px-2 py-3 text-center transition-all duration-200 sm:flex sm:items-center sm:justify-center sm:gap-2 sm:py-3 sm:pl-3 sm:pr-4 ${
                feedType === "friends"
                  ? "bg-gradient-to-b from-uri-keaney/45 to-uri-keaney/20 text-white shadow-[0_0_24px_rgba(104,171,232,0.2)] ring-1 ring-uri-keaney/50"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/85"
              }`}
            >
              <span className="text-xl leading-none sm:text-lg" aria-hidden>
                👥
              </span>
              <span className="mt-1 block text-xs font-bold sm:mt-0 sm:text-sm">Friends</span>
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/45 sm:text-left sm:text-xs">{feedHint}</p>
      </div>

      <div className="border-b border-white/[0.06] bg-white/[0.02] px-3 pb-3 pt-3 sm:px-4">
        <button
          type="button"
          onClick={() => setComposerOpen((open) => !open)}
          className="flex w-full items-center gap-3 rounded-2xl border border-uri-keaney/25 bg-gradient-to-r from-uri-keaney/10 to-transparent px-3 py-3 text-left transition-colors hover:border-uri-keaney/40 hover:from-uri-keaney/[0.14] active:bg-white/[0.04] sm:px-4"
          aria-expanded={composerOpen}
          aria-label={composerOpen ? "Close composer" : "Post to the Quad"}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-uri-keaney/35 bg-uri-navy/80 shadow-inner sm:h-12 sm:w-12">
            <AvatarDisplay avatar={character.avatar} size={44} classId={character.classId} starterWeapon={character.starterWeapon} />
          </div>
          <span className="min-w-0 flex-1 text-sm text-white/55 sm:text-[15px]">
            {composerOpen ? "Close composer" : "Share a Field Note to the Quad…"}
          </span>
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white/80 transition-transform duration-200 ${
              composerOpen ? "rotate-45 border-uri-keaney/40 bg-uri-keaney/20 text-uri-keaney" : ""
            }`}
            aria-hidden
          >
            +
          </span>
        </button>
        {composerOpen && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
            <FieldNoteComposer
              character={character}
              defaultVisibility={feedType}
              onPosted={() => {
                refresh();
                setComposerOpen(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="max-h-[min(65vh,32rem)] divide-y divide-white/[0.06] overflow-y-auto overscroll-y-contain bg-white/[0.02] sm:max-h-[65vh]">
        {notes.length === 0 ? (
          <div className="px-4 py-16 text-center sm:py-20">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-uri-keaney/30 bg-gradient-to-br from-uri-keaney/15 to-transparent text-4xl shadow-[0_0_28px_rgba(104,171,232,0.12)]"
              aria-hidden
            >
              📝
            </div>
            <p className="font-display text-lg font-bold text-white sm:text-xl">
              {feedType === "public" ? "No public posts yet" : "No friends-only posts yet"}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
              {feedType === "public"
                ? "Be the first to share a win, study tip, or campus moment — everyone can see the public Quad."
                : "Post for friends only after you connect in Find Friends. Your circle sees these notes here."}
            </p>
            <p className="mt-6 text-xs font-medium text-uri-keaney/85">Tap the composer above to drop a Field Note.</p>
          </div>
        ) : (
          notes.map((note) => (
            <FieldNoteCard
              key={note.id}
              note={note}
              currentUserId={character.id}
              comments={getCommentsByNoteId(note.id)}
              onNod={handleNod}
              onHype={handleHype}
              onVerify={handleVerify}
              onAssist={handleAssist}
              onAddComment={handleAddComment}
              currentUser={{
                id: character.id,
                name: character.name,
                username: character.username,
                avatar: character.avatar,
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
