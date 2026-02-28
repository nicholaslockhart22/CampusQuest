"use client";

import { useMemo, useState, useCallback } from "react";
import { getFriends, getCharacterByUsername, getOutgoingRequests, sendFriendRequest, getCharacterById } from "@/lib/friendsStore";
import { unfollow, isFollowing, follow, followByUsername } from "@/lib/followStore";
import { getGuilds, getMaxGuildLevelForCharacter, GUILD_INTEREST_LABELS } from "@/lib/guildStore";
import { CAMPUS_LEADERBOARD_PLACEHOLDERS } from "@/lib/campusLeaderboard";
import type { Character } from "@/lib/types";
import type { Friend } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS } from "@/lib/types";
import { AvatarDisplay } from "./AvatarDisplay";

type SortBy = "level" | (typeof STAT_KEYS)[number] | "bossesDefeated" | "finalBossesDefeated" | "guildLevel";

const SORT_OPTIONS: { value: SortBy; label: string; icon: string }[] = [
  { value: "level", label: "Level", icon: "⭐" },
  ...STAT_KEYS.map((key) => ({ value: key as SortBy, label: STAT_LABELS[key], icon: STAT_ICONS[key] })),
  { value: "bossesDefeated", label: "Bosses defeated", icon: "⚔️" },
  { value: "finalBossesDefeated", label: "Final bosses defeated", icon: "👑" },
  { value: "guildLevel", label: "Guild level", icon: "🛡️" },
];

function getSortValueFriend(f: Friend, sortBy: SortBy, getGuildLevel: (userId: string) => number): number {
  if (sortBy === "level") return f.level;
  if (sortBy === "bossesDefeated") return f.bossesDefeatedCount ?? 0;
  if (sortBy === "finalBossesDefeated") return f.finalBossesDefeatedCount ?? 0;
  if (sortBy === "guildLevel") return getGuildLevel(f.userId);
  return f.stats[sortBy] ?? 0;
}

function getSortValueCampus(
  e: { level: number; stats: Record<string, number>; bossesDefeatedCount?: number; finalBossesDefeatedCount?: number; highestGuildLevel?: number },
  sortBy: SortBy
): number {
  if (sortBy === "level") return e.level;
  if (sortBy === "bossesDefeated") return e.bossesDefeatedCount ?? 0;
  if (sortBy === "finalBossesDefeated") return e.finalBossesDefeatedCount ?? 0;
  if (sortBy === "guildLevel") return e.highestGuildLevel ?? 0;
  return e.stats[sortBy] ?? 0;
}

export function Leaderboards({ character }: { character: Character }) {
  const [sortBy, setSortBy] = useState<SortBy>("level");
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedGuildId, setExpandedGuildId] = useState<string | null>(null);

  const getGuildLevel = (userId: string) => getMaxGuildLevelForCharacter(userId);
  const currentUserGuildLevel = getMaxGuildLevelForCharacter(character.id);

  const friends = useMemo(() => {
    const list = getFriends(character.id);
    return [...list].sort((a, b) => {
      const va = getSortValueFriend(a, sortBy, getGuildLevel);
      const vb = getSortValueFriend(b, sortBy, getGuildLevel);
      if (vb !== va) return vb - va;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [character.id, sortBy, refreshKey]);

  const campusSorted = useMemo(() => {
    return [...CAMPUS_LEADERBOARD_PLACEHOLDERS].sort((a, b) => {
      const va = getSortValueCampus(a, sortBy);
      const vb = getSortValueCampus(b, sortBy);
      if (vb !== va) return vb - va;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [sortBy]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Level";

  const guildsSorted = useMemo(() => {
    const list = getGuilds();
    return [...list].sort((a, b) => {
      const levelA = a.xp != null ? 1 + Math.floor(a.xp / 100) : a.level;
      const levelB = b.xp != null ? 1 + Math.floor(b.xp / 100) : b.level;
      if (levelB !== levelA) return levelB - levelA;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <section className="space-y-6">
      {/* Filter by stat */}
      <div className="card p-4 sm:p-5">
        <h2 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
          <span aria-hidden>🏆</span> Rank by
        </h2>
        <p className="text-sm text-white/50 mb-3">
          {sortBy === "guildLevel"
            ? "Guild level shows guilds only, sorted by highest level."
            : "Filter leaderboards by stat or level."}
        </p>
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

      {sortBy === "guildLevel" ? (
        /* Guild leaderboard — guild names only, sorted by level */
        <div className="card p-4 sm:p-5">
          <h2 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
            <span aria-hidden>🛡️</span> Guild leaderboard
          </h2>
          <p className="text-sm text-white/50 mb-4">
            Guilds ranked by level (highest first). Ties sorted by name.
          </p>
          {guildsSorted.length === 0 ? (
            <p className="text-sm text-white/50 py-4">No guilds yet.</p>
          ) : (
            <ul className="space-y-2">
              {guildsSorted.map((guild, index) => {
                const level = guild.xp != null ? 1 + Math.floor(guild.xp / 100) : guild.level;
                const rank = index + 1;
                const podiumGlow = rank <= 3 ? RANK_GLOW[rank as 1 | 2 | 3] : "";
                const rankStyle = rank === 1 ? "font-bold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" : rank === 2 ? "font-bold text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.8)]" : rank === 3 ? "font-bold text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" : "text-white/60 font-mono";
                const isExpanded = expandedGuildId === guild.id;
                return (
                  <li
                    key={guild.id}
                    className={`rounded-xl border overflow-hidden ${rank <= 3 ? podiumGlow : "bg-white/5 border-white/10"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedGuildId(isExpanded ? null : guild.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <span className={`w-8 text-sm font-mono flex-shrink-0 ${rankStyle}`}>
                        #{rank}
                      </span>
                      <span className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-uri-keaney/30 flex-shrink-0">
                        {guild.crest}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{guild.name}</p>
                        <p className="text-xs text-white/50">{GUILD_INTEREST_LABELS[guild.interest]}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-uri-keaney font-semibold">Lv.{level}</p>
                        <p className="text-xs text-white/50">{guild.memberIds.length} members</p>
                      </div>
                      <span className="text-white/50 text-sm flex-shrink-0" aria-hidden>
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Members</p>
                        <ul className="space-y-2">
                          {guild.memberIds.length === 0 ? (
                            <li className="text-sm text-white/50">No members yet.</li>
                          ) : (
                            guild.memberIds.map((memberId) => {
                              const member = getCharacterById(memberId);
                              const isCreator = memberId === guild.createdByUserId;
                              return (
                                <li
                                  key={memberId}
                                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-uri-keaney/30">
                                    {member ? <AvatarDisplay avatar={member.avatar} size={36} /> : <span className="text-lg opacity-60">👤</span>}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-white text-sm truncate">{member ? member.name : "Unknown"}</p>
                                    <p className="text-xs text-white/50 truncate">{member ? `@${member.username}` : memberId}</p>
                                  </div>
                                  {isCreator && (
                                    <span className="text-[10px] font-semibold text-uri-gold px-1.5 py-0.5 rounded bg-uri-gold/20 flex-shrink-0">Founder</span>
                                  )}
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <>
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
                {friends.map((friend, index) => {
              const following = isFollowing(character.id, friend.userId);
              return (
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
                  statValue={
                    sortBy === "level"
                      ? undefined
                      : sortBy === "bossesDefeated"
                        ? (friend.bossesDefeatedCount ?? 0)
                        : sortBy === "finalBossesDefeated"
                          ? (friend.finalBossesDefeatedCount ?? 0)
                          : sortBy === "guildLevel"
                            ? getGuildLevel(friend.userId)
                            : (friend.stats[sortBy] ?? 0)
                  }
                  statLabel={
                    sortBy === "level"
                      ? undefined
                      : sortBy === "bossesDefeated"
                        ? "Bosses defeated"
                        : sortBy === "finalBossesDefeated"
                          ? "Final bosses defeated"
                          : sortBy === "guildLevel"
                            ? "Guild level"
                            : STAT_LABELS[sortBy]
                  }
                  actions={
                    <div className="flex flex-col items-end gap-1">
                      {following ? (
                        <button
                          type="button"
                          onClick={() => { unfollow(character.id, friend.userId); refresh(); }}
                          className="text-xs font-medium text-white/70 hover:text-white px-2.5 py-1 rounded-lg border border-white/20 hover:bg-white/10"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { follow(character.id, friend.userId); refresh(); }}
                          className="text-xs font-medium text-uri-keaney hover:bg-uri-keaney/15 px-2.5 py-1 rounded-lg border border-uri-keaney/30"
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  }
                />
              );
            })}
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
          {campusSorted.map((entry, index) => {
            const isCurrentUser = character.username.toLowerCase() === entry.username.toLowerCase();
            const friendsList = getFriends(character.id);
            const targetChar = getCharacterByUsername(entry.username);
            const targetId = targetChar?.id;
            const isFriend = friendsList.some((f) => f.username.toLowerCase() === entry.username.toLowerCase());
            const outgoingRequests = getOutgoingRequests(character.id);
            const hasOutgoingRequest = outgoingRequests.some((r) => r.toUsername === entry.username.toLowerCase());
            const following = targetId != null && isFollowing(character.id, targetId);
            const statValue =
              sortBy === "level"
                ? undefined
                : sortBy === "bossesDefeated"
                  ? (isCurrentUser ? (character.bossesDefeatedCount ?? 0) : (entry.bossesDefeatedCount ?? 0))
                  : sortBy === "finalBossesDefeated"
                    ? (isCurrentUser ? (character.finalBossesDefeatedCount ?? 0) : (entry.finalBossesDefeatedCount ?? 0))
                    : sortBy === "guildLevel"
                      ? (isCurrentUser ? currentUserGuildLevel : (entry.highestGuildLevel ?? 0))
                      : (entry.stats[sortBy] ?? 0);
            const statLabel =
              sortBy === "level"
                ? undefined
                : sortBy === "bossesDefeated"
                  ? "Bosses defeated"
                  : sortBy === "finalBossesDefeated"
                    ? "Final bosses defeated"
                    : sortBy === "guildLevel"
                      ? "Guild level"
                      : STAT_LABELS[sortBy];
            return (
              <LeaderboardRow
                key={entry.id}
                rank={index + 1}
                name={entry.name}
                username={entry.username}
                avatar={entry.avatar}
                level={entry.level}
                totalXP={entry.totalXP}
                isCurrentUser={isCurrentUser}
                sortBy={sortBy}
                statValue={statValue}
                statLabel={statLabel}
                actions={
                  isCurrentUser ? undefined : (
                    <div className="flex flex-col items-end gap-1">
                      {!isFriend && (
                        hasOutgoingRequest ? (
                          <span className="text-xs text-white/50">Pending</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              sendFriendRequest(character, entry.username);
                              refresh();
                            }}
                            className="text-xs font-medium text-uri-keaney hover:bg-uri-keaney/15 px-2.5 py-1 rounded-lg border border-uri-keaney/30"
                          >
                            Add friend
                          </button>
                        )
                      )}
                      {targetId != null ? (
                        following ? (
                          <button
                            type="button"
                            onClick={() => { unfollow(character.id, targetId); refresh(); }}
                            className="text-xs font-medium text-white/70 hover:text-white px-2.5 py-1 rounded-lg border border-white/20 hover:bg-white/10"
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              followByUsername(character.id, entry.username, getCharacterByUsername);
                              refresh();
                            }}
                            className="text-xs font-medium text-uri-keaney hover:bg-uri-keaney/15 px-2.5 py-1 rounded-lg border border-uri-keaney/30"
                          >
                            Follow
                          </button>
                        )
                      ) : null}
                    </div>
                  )
                }
              />
            );
          })}
        </ul>
      </div>
        </>
      )}
    </section>
  );
}

const RANK_GLOW = {
  1: "ring-2 ring-amber-300 shadow-[0_0_26px_rgba(251,191,36,0.55),0_0_14px_rgba(245,158,11,0.4)] border-amber-400/80 bg-gradient-to-br from-amber-400/20 to-amber-600/10",
  2: "ring-2 ring-slate-200 shadow-[0_0_24px_rgba(226,232,240,0.6),0_0_12px_rgba(203,213,225,0.5)] border-slate-300/80 bg-gradient-to-br from-slate-400/15 to-slate-500/10",
  3: "ring-2 ring-amber-600 shadow-[0_0_24px_rgba(217,119,6,0.5),0_0_12px_rgba(180,83,9,0.4)] border-amber-600/70 bg-gradient-to-br from-amber-700/15 to-amber-800/10",
} as const;

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
  actions,
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
  actions?: React.ReactNode;
}) {
  const rankStyle = rank === 1 ? "font-bold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" : rank === 2 ? "font-bold text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.8)]" : rank === 3 ? "font-bold text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" : "text-white/60 font-mono";
  const podiumGlow = rank <= 3 ? RANK_GLOW[rank as 1 | 2 | 3] : "";
  return (
    <li
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        rank <= 3 ? podiumGlow : isCurrentUser ? "bg-uri-keaney/15 border-uri-keaney/40" : "bg-white/5 border-white/10"
      }`}
    >
      <span className={`w-8 text-sm ${rankStyle}`}>#{rank}</span>
      <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/15 overflow-hidden">
        <AvatarDisplay avatar={avatar} size={40} />
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
      {actions != null && <div className="flex-shrink-0">{actions}</div>}
    </li>
  );
}
