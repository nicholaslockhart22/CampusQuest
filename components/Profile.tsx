"use client";

import { useState, useCallback, useEffect } from "react";
import type { Character } from "@/lib/types";
import type { FieldNote } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS, MAX_STAT, type StatKey } from "@/lib/types";
import { getFeedByAuthorId, nodFieldNote, rallyFieldNote, getCommentsByNoteId, addComment } from "@/lib/feedStore";
import { getFriends, getOutgoingRequests } from "@/lib/friendsStore";
import { getUserBosses } from "@/lib/store";
import { getClassTitle, getClassRealm } from "@/lib/characterClasses";
import { AvatarDisplay } from "./AvatarDisplay";
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

  const friends = getFriends(character.id);
  const following = getOutgoingRequests(character.id).length;
  const friendsCount = friends.length;
  const bosses = getUserBosses();
  const bossesDefeated =
    character.bossesDefeatedCount ?? bosses.filter((b) => b.defeated).length;
  const finalBossesDefeated =
    character.finalBossesDefeatedCount ?? bosses.filter((b) => b.defeated && b.maxHp > 500).length;

  return (
    <div className="space-y-6">
      {/* Instagram-style header: avatar + name + counts */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex justify-center sm:justify-start">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-uri-keaney/30 to-uri-navy border-4 border-uri-keaney/40 flex items-center justify-center overflow-hidden shadow-lg"
              aria-hidden
            >
              <AvatarDisplay
                avatar={character.avatar}
                size={112}
                className="rounded-full"
                classId={character.classId}
                starterWeapon={character.starterWeapon}
              />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
              {character.name}
            </h2>
            <p className="text-uri-keaney/90 text-sm mt-0.5">@{character.username}</p>
            {character.classId && (getClassTitle(character.classId) || getClassRealm(character.classId)) && (
              <p className="text-uri-gold/90 text-sm mt-1 font-medium">
                {getClassTitle(character.classId)}
                {getClassRealm(character.classId) && (
                  <span className="text-white/50 font-normal"> · {getClassRealm(character.classId)}</span>
                )}
              </p>
            )}
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
          {STAT_KEYS.map((key: StatKey) => {
            const value = character.stats[key] ?? 0;
            const pct = Math.min(100, (value / MAX_STAT) * 100);
            const atMax = value >= MAX_STAT;
            const prestigeCount = character.statPrestige?.[key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-white/80 text-sm w-24 flex-shrink-0 flex items-center gap-1" title={STAT_LABELS[key]}>
                  {STAT_ICONS[key]} {STAT_LABELS[key]}
                  {prestigeCount > 0 && (
                    <span className="text-uri-gold/90 font-mono text-xs">{prestigeCount}</span>
                  )}
                </span>
                <div
                  className={`stat-bar flex-1 min-w-0 ${atMax ? "bg-uri-gold/20 border border-uri-gold/40 shadow-[0_0_10px_rgba(197,165,40,0.15)]" : ""}`}
                >
                  <div
                    className={`stat-fill ${atMax ? "bg-gradient-to-r from-uri-gold via-amber-400 to-uri-gold shadow-[0_0_8px_rgba(197,165,40,0.4)] border border-uri-gold/50" : "bg-uri-keaney"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`font-mono text-sm w-10 text-right ${atMax ? "text-uri-gold font-semibold" : "text-uri-keaney"}`}>
                  {value}{atMax ? " ★" : ""}
                </span>
              </div>
            );
          })}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
