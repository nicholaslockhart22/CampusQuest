"use client";

import { useMemo, useState } from "react";
import { getFriends } from "@/lib/friendsStore";
import { CAMPUS_LEADERBOARD_PLACEHOLDERS } from "@/lib/campusLeaderboard";
import type { Character } from "@/lib/types";
import type { Friend } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS } from "@/lib/types";

type SortBy = "level" | (typeof STAT_KEYS)[number];

const SORT_OPTIONS: { value: SortBy; label: string; icon: string }[] = [
  { value: "level", label: "Level", icon: "⭐" },
  ...STAT_KEYS.map((key) => ({ value: key as SortBy, label: STAT_LABELS[key], icon: STAT_ICONS[key] })),
];

function getSortValueFriend(f: Friend, sortBy: SortBy): number {
  if (sortBy === "level") return f.level;
  return f.stats[sortBy] ?? 0;
}

function getSortValueCampus(e: { level: number; stats: Record<string, number> }, sortBy: SortBy): number {
  if (sortBy === "level") return e.level;
  return e.stats[sortBy] ?? 0;
}

export function Leaderboards({ character }: { character: Character }) {
  const [sortBy, setSortBy] = useState<SortBy>("level");

  const friends = useMemo(() => {
    const list = getFriends(character.id);
    return [...list].sort((a, b) => getSortValueFriend(b, sortBy) - getSortValueFriend(a, sortBy));
  }, [character.id, sortBy]);

  const campusSorted = useMemo(() => {
    return [...CAMPUS_LEADERBOARD_PLACEHOLDERS].sort(
      (a, b) => getSortValueCampus(b, sortBy) - getSortValueCampus(a, sortBy)
    );
  }, [sortBy]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Level";

  return (
    <section className="space-y-6">
      {/* Filter by stat */}
      <div className="card p-4 sm:p-5">
        <h2 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
          <span aria-hidden>🏆</span> Rank by
        </h2>
        <p className="text-sm text-white/50 mb-3">Filter leaderboards by stat or level.</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortBy(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                sortBy === opt.value
                  ? "bg-uri-keaney text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/15"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Friends leaderboard */}
      <div className="card p-4 sm:p-5">
        <h2 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
          <span aria-hidden>🦌</span> Friends leaderboard
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Ranked by {sortLabel}. Only your accepted friends.
        </p>
        {friends.length === 0 ? (
          <p className="text-sm text-white/50 py-4">No friends yet. Add friends in Find Friends to see them here.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend, index) => (
              <LeaderboardRow
                key={friend.userId}
                rank={index + 1}
                name={friend.name}
                username={friend.username}
                avatar={friend.avatar}
                level={friend.level}
                totalXP={friend.totalXP}
                isCurrentUser={false}
                sortBy={sortBy}
                statValue={sortBy === "level" ? undefined : (friend.stats[sortBy] ?? 0)}
                statLabel={sortBy === "level" ? undefined : STAT_LABELS[sortBy]}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Campus leaderboard */}
      <div className="card p-4 sm:p-5">
        <h2 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
          <span aria-hidden>🏛️</span> Campus leaderboard
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Top students by {sortLabel}. (Placeholder data.)
        </p>
        <ul className="space-y-2">
          {campusSorted.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              rank={index + 1}
              name={entry.name}
              username={entry.username}
              avatar={entry.avatar}
              level={entry.level}
              totalXP={entry.totalXP}
              isCurrentUser={character.username.toLowerCase() === entry.username.toLowerCase()}
              sortBy={sortBy}
              statValue={sortBy === "level" ? undefined : (entry.stats[sortBy] ?? 0)}
              statLabel={sortBy === "level" ? undefined : STAT_LABELS[sortBy]}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function LeaderboardRow({
  rank,
  name,
  username,
  avatar,
  level,
  totalXP,
  isCurrentUser,
  sortBy,
  statValue,
  statLabel,
}: {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  level: number;
  totalXP: number;
  isCurrentUser: boolean;
  sortBy?: SortBy;
  statValue?: number;
  statLabel?: string;
}) {
  const rankStyle = rank <= 3 ? "font-bold text-uri-keaney" : "text-white/60 font-mono";
  return (
    <li
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        isCurrentUser ? "bg-uri-keaney/15 border-uri-keaney/40" : "bg-white/5 border-white/10"
      }`}
    >
      <span className={`w-8 text-sm ${rankStyle}`}>#{rank}</span>
      <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0 border border-white/15">
        {avatar}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate flex items-center gap-1.5">
          {name}
          {isCurrentUser && <span className="text-xs text-uri-keaney font-normal">(you)</span>}
        </p>
        <p className="text-xs text-white/50 truncate">@{username}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        {sortBy !== "level" && statLabel != null && statValue != null ? (
          <>
            <p className="text-uri-keaney font-semibold text-sm">{statLabel} {statValue}</p>
            <p className="text-xs text-white/50">Lv.{level} · {totalXP} XP</p>
          </>
        ) : (
          <>
            <p className="text-uri-keaney font-semibold">Lv.{level}</p>
            <p className="text-xs text-white/50 font-mono">{totalXP} XP</p>
          </>
        )}
      </div>
    </li>
  );
}
