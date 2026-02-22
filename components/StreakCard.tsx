"use client";

import type { Character } from "@/lib/types";

export function StreakCard({ character }: { character: Character }) {
  const days = character.streakDays ?? 0;

  return (
    <div className="rounded-2xl bg-white/[0.08] border border-white/20 px-4 py-3 flex items-center gap-3 shadow-lg shadow-black/10">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="font-semibold text-white">{days}-day streak</div>
        <div className="text-xs text-white/50">Earn at least 20 XP per day to keep your streak.</div>
      </div>
    </div>
  );
}
