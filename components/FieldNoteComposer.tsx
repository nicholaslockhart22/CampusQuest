"use client";

import { useState, useCallback } from "react";
import { createFieldNote, normalizeRamMarkTag } from "@/lib/feedStore";
import type { Character } from "@/lib/types";
import { FIELD_NOTE_MAX_CHARS, RAMMARK_MAX_LENGTH, RAMMARK_MAX_PER_POST } from "@/lib/types";
import type { RamMark } from "@/lib/types";

export function FieldNoteComposer({
  character,
  onPosted,
}: {
  character: Character;
  onPosted: () => void;
}) {
  const [body, setBody] = useState("");
  const [ramMarkInput, setRamMarkInput] = useState("");
  const [ramMarks, setRamMarks] = useState<RamMark[]>([]);
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bodyCount = body.length;
  const canAddRamMark = ramMarks.length < RAMMARK_MAX_PER_POST && ramMarkInput.trim().length > 0 &&
    normalizeRamMarkTag(ramMarkInput).length <= RAMMARK_MAX_LENGTH;

  const addRamMark = useCallback(() => {
    const tag = normalizeRamMarkTag(ramMarkInput).slice(0, RAMMARK_MAX_LENGTH);
    if (!tag || ramMarks.length >= RAMMARK_MAX_PER_POST) return;
    if (ramMarks.some((r) => r.tag === tag)) {
      setRamMarkInput("");
      return;
    }
    setRamMarks((prev) => [...prev, { id: `rm-${Date.now()}-${tag}`, tag }]);
    setRamMarkInput("");
  }, [ramMarkInput, ramMarks.length]);

  const removeRamMark = useCallback((tag: string) => {
    setRamMarks((prev) => prev.filter((r) => r.tag !== tag));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write something for your Field Note.");
      return;
    }
    if (trimmed.length > FIELD_NOTE_MAX_CHARS) {
      setError(`Keep it under ${FIELD_NOTE_MAX_CHARS} characters.`);
      return;
    }
    const note = createFieldNote({
      authorId: character.id,
      authorName: character.name,
      authorUsername: character.username,
      authorAvatar: character.avatar,
      body: trimmed,
      ramMarks,
      proofUrl: proofUrl.trim() || undefined,
    });
    if (note) {
      setBody("");
      setRamMarks([]);
      setProofUrl("");
      onPosted();
    } else {
      setError("Could not post.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, FIELD_NOTE_MAX_CHARS))}
        placeholder="What’s happening on campus? (Field Note)"
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:border-uri-keaney/50 resize-none"
      />
      <div className="flex items-center justify-between text-xs">
        <span className={bodyCount > FIELD_NOTE_MAX_CHARS ? "text-red-400" : "text-white/50"}>
          {bodyCount} / {FIELD_NOTE_MAX_CHARS}
        </span>
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Proof photo (optional — link for XP flair)</label>
        <input
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="Paste image URL (e.g. study pic, workout proof)"
          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/60">RAMarks (optional):</span>
        {ramMarks.map((r) => (
          <span
            key={r.id}
            className="ram-mark flex items-center gap-1"
          >
            #{r.tag}
            <button
              type="button"
              onClick={() => removeRamMark(r.tag)}
              className="ml-0.5 text-uri-navy/70 hover:text-uri-navy"
              aria-label={`Remove ${r.tag}`}
            >
              ×
            </button>
          </span>
        ))}
        {ramMarks.length < RAMMARK_MAX_PER_POST && (
          <>
            <input
              type="text"
              value={ramMarkInput}
              onChange={(e) => setRamMarkInput(e.target.value.slice(0, RAMMARK_MAX_LENGTH))}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRamMark())}
              placeholder={`#tag (max ${RAMMARK_MAX_LENGTH})`}
              className="w-28 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-uri-keaney"
            />
            <button
              type="button"
              onClick={addRamMark}
              disabled={!canAddRamMark}
              className="text-xs px-2 py-1 rounded-lg bg-uri-keaney/30 text-uri-keaney disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={!body.trim()}
        className="w-full py-2.5 rounded-xl font-semibold bg-uri-keaney text-uri-navy hover:bg-uri-keaney/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        Post Field Note
      </button>
    </form>
  );
}
