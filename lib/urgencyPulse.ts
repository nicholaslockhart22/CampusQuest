"use client";

import type { Character } from "./types";
import { getFriends } from "./friendsStore";
import { loadCampusBossEvent, campusBossPercentHp } from "./campusBossEvent";
import { getGuilds, getGuildById } from "./guildStore";
import { getUserBosses, getActiveBoss } from "./store";
import { getGuildWeeklyScores } from "./guildWeeklyRace";

export interface UrgencyItem {
  id: string;
  icon: string;
  title: string;
  body: string;
  ts: number;
}

/** Simulated “open the app” hooks from local state (no push backend). */
export function buildUrgencyFeed(character: Character): UrgencyItem[] {
  const items: UrgencyItem[] = [];
  const now = Date.now();

  const friends = getFriends(character.id)
    .filter((f) => f.userId !== character.id)
    .sort((a, b) => b.totalXP - a.totalXP);
  const ahead = friends.find((f) => f.totalXP > character.totalXP);
  if (ahead) {
    items.push({
      id: "u-passed",
      icon: "📈",
      title: "Leaderboard heat",
      body: `${ahead.name} is ahead of you on XP — log an activity to climb back.`,
      ts: now - 5 * 60_000,
    });
  }

  const guilds = getGuilds().filter((g) => g.memberIds.includes(character.id));
  const weekly = getGuildWeeklyScores();
  if (guilds.length > 0 && weekly.length >= 2) {
    const topGuild = getGuildById(weekly[0].guildId);
    const secondGuild = getGuildById(weekly[1].guildId);
    const myIds = new Set(character.guildIds ?? []);
    const amSecond = secondGuild && myIds.has(secondGuild.id);
    if (amSecond && topGuild) {
      items.push({
        id: "u-guild-weekly-2",
        icon: "⚔️",
        title: "Guild race",
        body: `${topGuild.name} is #1 this week. Push ${secondGuild.name} to the top for +10% XP next week!`,
        ts: now - 25 * 60_000,
      });
    }
  }

  const boss = getActiveBoss();
  if (boss && !boss.defeated && boss.maxHp > 0) {
    const pct = Math.round((boss.currentHp / boss.maxHp) * 100);
    if (pct <= 25) {
      items.push({
        id: "u-boss-low",
        icon: "⚔️",
        title: "Boss almost down",
        body: `"${boss.name}" is under 25% HP — finish it today for big XP.`,
        ts: now - 15 * 60_000,
      });
    } else if (pct >= 70 && pct <= 85) {
      items.push({
        id: "u-boss-mid",
        icon: "🎯",
        title: "Boss update",
        body: `"${boss.name}" is around ${pct}% HP — keep logging to close it out.`,
        ts: now - 50 * 60_000,
      });
    }
  }

  const campus = loadCampusBossEvent();
  const cp = campusBossPercentHp(campus);
  if (cp > 15 && cp <= 40) {
    items.push({
      id: "u-campus-boss",
      icon: "🌐",
      title: "Campus-wide boss",
      body: `${campus.name} is at ~${cp}% HP. Your logs add real damage to the raid bar!`,
      ts: now - 70 * 60_000,
    });
  }

  if ((character.streakDays ?? 0) >= 3) {
    items.push({
      id: "u-streak",
      icon: "🔥",
      title: "Streak precious",
      body: "Don't lose your streak — quick 20+ XP log keeps the fire alive.",
      ts: now - 120 * 60_000,
    });
  }

  const pendingBosses = getUserBosses().filter((b) => !b.defeated).length;
  if (pendingBosses >= 2) {
    items.push({
      id: "u-multi-boss",
      icon: "👾",
      title: "Multiple bosses active",
      body: `You have ${pendingBosses} undefeated bosses. Pick one and focus fire.`,
      ts: now - 180 * 60_000,
    });
  }

  return items.sort((a, b) => b.ts - a.ts);
}
