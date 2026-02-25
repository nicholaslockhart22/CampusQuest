"use client";

import type { Character } from "@/lib/types";

export function StreakCard({ character }: { character: Character }) {
  const days = character.streakDays ?? 0;

  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <span className="text-2xl" aria-hidden>🔥</span>
      <div>
        <div className="font-semibold text-white">{days}-day streak</div>
        <div className="text-xs text-white/50">Earn 20+ XP per day to keep your streak.</div>
      </div>
    </div>
  );
}
