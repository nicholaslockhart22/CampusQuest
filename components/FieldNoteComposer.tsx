"use client";

import { useState, useCallback, useRef } from "react";
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
  const proofFileRef = useRef<HTMLInputElement>(null);

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

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (e.g. JPEG, PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProofUrl(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

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
        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder-white/45 focus:outline-none focus:ring-2 focus:ring-uri-keaney/40 focus:border-uri-keaney/40 resize-none transition-colors"
      />
      <div className="flex items-center justify-between text-xs">
        <span className={bodyCount > FIELD_NOTE_MAX_CHARS ? "text-red-400" : "text-white/50"}>
          {bodyCount} / {FIELD_NOTE_MAX_CHARS}
        </span>
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1">Proof photo (optional)</label>
        <input
          type="url"
          value={proofUrl.startsWith("data:") ? "" : proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="Paste image URL or add from device"
          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/50"
        />
        <input
          ref={proofFileRef}
          type="file"
          accept="image/*"
          onChange={handleProofFileChange}
          className="hidden"
          aria-label="Add photo from device"
        />
        <button
          type="button"
          onClick={() => proofFileRef.current?.click()}
          className="mt-2 text-xs font-medium text-uri-keaney hover:text-uri-keaney/80 px-3 py-2 rounded-lg border border-uri-keaney/40 hover:bg-uri-keaney/10 transition-colors"
        >
          📷 Add photo from device
        </button>
        {proofUrl.startsWith("data:") && (
          <div className="mt-2 rounded-xl overflow-hidden border border-white/15 max-w-[180px]">
            <img src={proofUrl} alt="Proof" className="w-full h-20 object-cover" />
          </div>
        )}
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
        className="w-full py-3 rounded-xl font-semibold bg-uri-keaney text-white hover:bg-uri-keaney/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-uri-keaney/40 shadow-[0_0_12px_rgba(104,171,232,0.15)]"
      >
        Post to The Quad
      </button>
    </form>
  );
}
