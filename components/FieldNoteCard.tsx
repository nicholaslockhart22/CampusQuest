"use client";

import type { FieldNote } from "@/lib/types";
import { AvatarDisplay } from "./AvatarDisplay";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
  return d.toLocaleDateString();
}

export function FieldNoteCard({
  note,
  currentUserId,
  onNod,
  onRally,
}: {
  note: FieldNote;
  currentUserId: string;
  onNod: (noteId: string) => void;
  onRally: (noteId: string) => void;
}) {
  const hasNodded = note.nodByUserIds.has(currentUserId);
  const hasRallied = note.rallyByUserIds.has(currentUserId);

  const proofImgUrl = note.proofUrl?.trim();
  const isImgUrl = proofImgUrl && /\.(jpe?g|png|gif|webp)/i.test(proofImgUrl);

  return (
    <article className="p-4 hover:bg-white/[0.04] transition-colors">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-uri-keaney/25 to-uri-navy flex items-center justify-center flex-shrink-0 border border-uri-keaney/30 overflow-hidden">
          <AvatarDisplay avatar={note.authorAvatar} size={44} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{note.authorName}</span>
            <span className="text-uri-keaney/90 text-sm">@{note.authorUsername}</span>
            <span className="text-white/40 text-xs">· {formatTime(note.createdAt)}</span>
          </div>
          <p className="text-white/90 mt-1 whitespace-pre-wrap break-words">{note.body}</p>
          {proofImgUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-white/15 max-w-full">
              {isImgUrl ? (
                <img src={proofImgUrl} alt="Proof" className="w-full max-h-48 object-cover" />
              ) : (
                <a href={proofImgUrl} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-uri-keaney text-sm truncate bg-white/5">
                  📎 Proof link
                </a>
              )}
            </div>
          )}
          {note.ramMarks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {note.ramMarks.map((r) => (
                <span key={r.id} className="ram-mark">
                  #{r.tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => onNod(note.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${hasNodded ? "text-uri-gold bg-uri-gold/10" : "text-white/55 hover:text-uri-gold hover:bg-white/5"}`}
              aria-label={hasNodded ? "Remove nod" : "Nod"}
            >
              <span>👍</span>
              <span>Nod</span>
              {note.nodCount > 0 && <span className="font-mono text-xs">({note.nodCount})</span>}
            </button>
            <button
              type="button"
              onClick={() => onRally(note.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${hasRallied ? "text-uri-keaney bg-uri-keaney/10" : "text-white/55 hover:text-uri-keaney hover:bg-white/5"}`}
              aria-label={hasRallied ? "Remove rally" : "Rally"}
            >
              <span>🦌</span>
              <span>Rally</span>
              {note.rallyCount > 0 && <span className="font-mono text-xs">({note.rallyCount})</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
