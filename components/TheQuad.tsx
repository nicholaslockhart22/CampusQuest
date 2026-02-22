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
    <section className="rounded-2xl bg-white/[0.08] border border-white/20 overflow-hidden shadow-xl shadow-black/20">
      <div className="px-4 py-3.5 border-b border-white/15 flex items-center justify-between flex-wrap gap-2 bg-white/[0.04]">
        <h2 className="font-display font-bold text-lg text-white">
          The Quad
        </h2>
        <RamMarkFilter
          selected={filter}
          onSelect={setFilter}
          options={getAllRamMarks()}
        />
      </div>
      <div className="p-4 border-b border-white/15 bg-white/[0.03]">
        <FieldNoteComposer
          character={character}
          onPosted={refresh}
        />
      </div>
      <div className="divide-y divide-white/10 max-h-[60vh] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-white/60 text-sm">
            No Field Notes yet. Post something to the Quad!
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
