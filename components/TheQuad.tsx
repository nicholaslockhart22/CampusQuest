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
    <section className="card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-uri-keaney/20 flex items-center justify-between flex-wrap gap-2 bg-uri-keaney/5">
        <h2 className="font-display font-bold text-lg text-white">
          The Quad
        </h2>
        <RamMarkFilter
          selected={filter}
          onSelect={setFilter}
          options={getAllRamMarks()}
        />
      </div>
      <div className="p-4 border-b border-uri-keaney/20 bg-uri-keaney/5">
        <FieldNoteComposer
          character={character}
          onPosted={refresh}
        />
      </div>
      <div className="divide-y divide-white/10 max-h-[60vh] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-10 sm:p-12 text-center">
            <p className="text-5xl mb-4 opacity-70" aria-hidden>📝</p>
            <p className="text-white font-semibold text-lg">No Field Notes yet</p>
            <p className="text-sm text-white/60 mt-2 max-w-xs mx-auto">
              Post a study sesh, workout, or campus moment. The Quad is where Rams share wins.
            </p>
            <p className="text-xs text-uri-keaney/80 mt-4 font-medium">Be the first to post above ↑</p>
            <p className="text-xs text-white/50 mt-2">Follow people in Find Friends to see their posts here.</p>
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
