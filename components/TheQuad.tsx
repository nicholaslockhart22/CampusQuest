"use client";

import { useState, useCallback, useEffect } from "react";
import { getFeed, nodFieldNote, rallyFieldNote, getAllRamMarks } from "@/lib/feedStore";
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
    setNotes(getFeed(filter ?? undefined));
    onRefresh?.();
  }, [filter, onRefresh]);

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
          <div className="p-10 text-center">
            <p className="text-4xl mb-3 opacity-50">📝</p>
            <p className="text-white/70 font-medium">No Field Notes yet</p>
            <p className="text-sm text-white/50 mt-1">Share a study’ sesh, workout, or campus moment.</p>
          </div>
        ) : (
          notes.map((note) => (
            <FieldNoteCard
              key={note.id}
              note={note}
              currentUserId={character.id}
              onNod={handleNod}
              onRally={handleRally}
            />
          ))
        )}
      </div>
    </section>
  );
}
