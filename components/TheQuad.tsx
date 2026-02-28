"use client";

import { useState, useCallback, useEffect } from "react";
import { getFeed, nodFieldNote, rallyFieldNote, getAllRamMarks, getCommentsByNoteId, addComment } from "@/lib/feedStore";
import type { FieldNote } from "@/lib/types";
import type { Character } from "@/lib/types";
import { FieldNoteComposer } from "@/components/FieldNoteComposer";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { RamMarkFilter } from "@/components/RamMarkFilter";

export function TheQuad({
  character,
  onRefresh,
}: {
  character: Character;
  onRefresh?: () => void;
}) {
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setNotes(getFeed(filter ?? undefined, character.id));
    onRefresh?.();
  }, [filter, character.id, onRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleNod(noteId: string) {
    nodFieldNote(noteId, character.id);
    refresh();
  }

  function handleRally(noteId: string) {
    rallyFieldNote(noteId, character.id);
    refresh();
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

  return (
    <section
      className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_1px_0_0_rgba(104,171,232,0.12),0_4px_20px_-4px_rgba(0,0,0,0.35)]"
      style={{
        background: "linear-gradient(180deg, rgba(4, 30, 66, 0.97) 0%, rgba(3, 22, 48, 0.95) 100%)",
      }}
    >
      {/* Header bar — matches top nav */}
      <div
        className="backdrop-blur-sm border-b border-white/[0.08] px-4 py-3.5 flex items-center justify-between flex-wrap gap-3"
        style={{
          background: "linear-gradient(180deg, rgba(4, 30, 66, 0.98) 0%, rgba(3, 22, 48, 0.97) 100%)",
          boxShadow: "0 1px 0 0 rgba(104, 171, 232, 0.1)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-uri-keaney/25 to-uri-keaney/10 border border-uri-keaney/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(104,171,232,0.15)]">
            <span className="text-lg leading-none" aria-hidden>📋</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-white text-base sm:text-lg tracking-tight truncate">
              The Quad
            </h2>
            <p className="text-[10px] sm:text-xs text-uri-keaney/80 font-medium truncate">
              Field Notes · Rams share wins
            </p>
          </div>
        </div>
        <RamMarkFilter
          selected={filter}
          onSelect={setFilter}
          options={getAllRamMarks()}
        />
      </div>

      {/* Composer */}
      <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
        <FieldNoteComposer
          character={character}
          onPosted={refresh}
        />
      </div>

      {/* Feed */}
      <div className="divide-y divide-white/[0.06] max-h-[60vh] overflow-y-auto bg-white/[0.02]">
        {notes.length === 0 ? (
          <div className="py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner" aria-hidden>
              📝
            </div>
            <p className="font-display font-semibold text-white text-lg">No Field Notes yet</p>
            <p className="text-sm text-white/50 mt-2 max-w-xs mx-auto leading-relaxed">
              Post a study sesh, workout, or campus moment. The Quad is where Rams share wins.
            </p>
            <p className="text-xs text-uri-keaney/80 mt-5 font-medium">Be the first to post above ↑</p>
            <p className="text-xs text-white/40 mt-1.5">Follow people in Find Friends to see their posts here.</p>
          </div>
        ) : (
          notes.map((note) => (
            <FieldNoteCard
              key={note.id}
              note={note}
              currentUserId={character.id}
              comments={getCommentsByNoteId(note.id)}
              onNod={handleNod}
              onRally={handleRally}
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
