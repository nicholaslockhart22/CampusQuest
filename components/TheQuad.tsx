"use client";

import { useState, useCallback, useEffect } from "react";
import { getFeed, nodFieldNote, vouchFieldNote, getCommentsByNoteId, addComment, type QuadFeedType } from "@/lib/feedStore";
import type { FieldNote } from "@/lib/types";
import type { Character } from "@/lib/types";
import { FieldNoteComposer } from "@/components/FieldNoteComposer";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { AvatarDisplay } from "@/components/AvatarDisplay";

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

  const refresh = useCallback(() => {
    setNotes(getFeed(character.id, feedType));
    onRefresh?.();
  }, [character.id, feedType, onRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleNod(noteId: string) {
    nodFieldNote(noteId, character.id);
    refresh();
  }

  function handleVouch(noteId: string) {
    vouchFieldNote(noteId, character.id);
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
      {/* Header bar — Public vs Friends tabs */}
      <div
        className="backdrop-blur-sm border-b border-white/[0.08] px-4 py-3.5"
        style={{
          background: "linear-gradient(180deg, rgba(4, 30, 66, 0.98) 0%, rgba(3, 22, 48, 0.97) 100%)",
          boxShadow: "0 1px 0 0 rgba(104, 171, 232, 0.1)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0 mb-3">
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
        <div className="flex rounded-xl bg-white/[0.06] p-1 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setFeedType("public")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              feedType === "public" ? "bg-uri-keaney/30 text-uri-keaney border border-uri-keaney/40" : "text-white/70 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            🌐 Public
          </button>
          <button
            type="button"
            onClick={() => setFeedType("friends")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              feedType === "friends" ? "bg-uri-keaney/30 text-uri-keaney border border-uri-keaney/40" : "text-white/70 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            👥 Friends
          </button>
        </div>
      </div>

      {/* Post trigger — Instagram-style: tap to expand composer */}
      <div className="border-b border-white/[0.08] bg-white/[0.02]">
        <button
          type="button"
          onClick={() => setComposerOpen((open) => !open)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors rounded-none"
          aria-expanded={composerOpen}
          aria-label={composerOpen ? "Close composer" : "Post to the Quad"}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-uri-keaney/25 to-uri-navy flex items-center justify-center overflow-hidden border border-uri-keaney/30 flex-shrink-0">
            <AvatarDisplay avatar={character.avatar} size={40} classId={character.classId} starterWeapon={character.starterWeapon} />
          </div>
          <span className="flex-1 text-white/50 text-sm">
            {composerOpen ? "Close" : "Post to the Quad..."}
          </span>
          <span
            className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium text-white/80 transition-transform ${composerOpen ? "rotate-45" : ""}`}
            aria-hidden
          >
            +
          </span>
        </button>
        {composerOpen && (
          <div className="px-4 pb-4 pt-0 border-t border-white/[0.06]">
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

      {/* Feed */}
      <div className="divide-y divide-white/[0.06] max-h-[65vh] overflow-y-auto bg-white/[0.02]">
        {notes.length === 0 ? (
          <div className="py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner" aria-hidden>
              📝
            </div>
            <p className="font-display font-semibold text-white text-lg">
              {feedType === "public" ? "No public posts yet" : "No friends-only posts yet"}
            </p>
            <p className="text-sm text-white/50 mt-2 max-w-xs mx-auto leading-relaxed">
              {feedType === "public"
                ? "Post to the Public Quad or tap above to add a Field Note. Everyone can see public posts."
                : "Only you and your friends see posts here. Add friends in Find Friends, then post to Friends only."}
            </p>
            <p className="text-xs text-uri-keaney/80 mt-5 font-medium">Tap &quot;Post to the Quad...&quot; above to add one.</p>
          </div>
        ) : (
          notes.map((note) => (
            <FieldNoteCard
              key={note.id}
              note={note}
              currentUserId={character.id}
              comments={getCommentsByNoteId(note.id)}
              onNod={handleNod}
              onVouch={handleVouch}
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
