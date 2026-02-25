"use client";

import { useState, useCallback, useEffect } from "react";
import type { Character } from "@/lib/types";
import type { FieldNote } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS } from "@/lib/types";
import { getFeedByAuthorId, nodFieldNote, rallyFieldNote } from "@/lib/feedStore";
import { getFriends, getOutgoingRequests } from "@/lib/friendsStore";
import { getUserBosses } from "@/lib/store";
import { FieldNoteCard } from "./FieldNoteCard";

export function Profile({ character }: { character: Character }) {
  const [posts, setPosts] = useState<FieldNote[]>([]);

  const refresh = useCallback(() => {
    setPosts(getFeedByAuthorId(character.id));
  }, [character.id]);

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

  const friends = getFriends(character.id);
  const following = getOutgoingRequests(character.id).length;
  const friendsCount = friends.length;
  const bosses = getUserBosses();
  const bossesDefeated = bosses.filter((b) => b.defeated).length;
  const finalBossesDefeated = bosses.filter((b) => b.defeated && b.maxHp > 500).length;

  return (
    <div className="space-y-6">
      {/* Instagram-style header: avatar + name + counts */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex justify-center sm:justify-start">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-uri-keaney/30 to-uri-navy border-4 border-uri-keaney/40 flex items-center justify-center text-4xl sm:text-5xl shadow-lg"
              aria-hidden
            >
              {character.avatar}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
              {character.name}
            </h2>
            <p className="text-uri-keaney/90 text-sm mt-0.5">@{character.username}</p>
            <div className="flex justify-center sm:justify-start gap-6 mt-4">
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-bold text-white text-lg">{posts.length}</span>
                <span className="text-white/60 text-xs">Posts</span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-bold text-white text-lg">{friendsCount}</span>
                <span className="text-white/60 text-xs">Friends</span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-bold text-white text-lg">{following}</span>
                <span className="text-white/60 text-xs">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar stats: level, XP, and the 5 stats */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
          Stats
        </h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="px-3 py-1.5 rounded-xl bg-uri-keaney/20 border border-uri-keaney/30">
            <span className="text-white/70 text-xs">Level</span>
            <span className="font-bold text-uri-keaney block text-lg">{character.level}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
            <span className="text-white/70 text-xs">Total XP</span>
            <span className="font-bold text-white block text-lg">{character.totalXP}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-uri-gold/15 border border-uri-gold/30">
            <span className="text-white/70 text-xs">Bosses defeated</span>
            <span className="font-bold text-uri-gold block text-lg">{bossesDefeated}</span>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl border shadow-[0_0_12px_rgba(197,165,40,0.15)]"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(197, 165, 40, 0.15) 100%)",
              borderColor: "rgba(197, 165, 40, 0.5)",
            }}
          >
            <span className="text-white/80 text-xs flex items-center gap-1">
              <span aria-hidden>👑</span> Final bosses defeated
            </span>
            <span className="font-bold block text-lg bg-clip-text text-transparent bg-gradient-to-r from-uri-gold to-amber-200">
              {finalBossesDefeated}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {STAT_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-white/80 text-sm w-24 flex-shrink-0" title={STAT_LABELS[key]}>
                {STAT_ICONS[key]} {STAT_LABELS[key]}
              </span>
              <div className="stat-bar flex-1 min-w-0">
                <div
                  className="stat-fill bg-uri-keaney"
                  style={{ width: `${Math.min(100, character.stats[key])}%` }}
                />
              </div>
              <span className="font-mono text-uri-keaney text-sm w-8 text-right">
                {character.stats[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All posts to the Quad */}
      <div>
        <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-3 px-1">
          Posts to the Quad
        </h3>
        {posts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-white/60 text-sm">No posts yet. Share something on The Quad!</p>
          </div>
        ) : (
          <div className="card divide-y divide-white/10">
            {posts.map((note) => (
              <FieldNoteCard
                key={note.id}
                note={note}
                currentUserId={character.id}
                onNod={handleNod}
                onRally={handleRally}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
