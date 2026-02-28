"use client";

import type { Character } from "@/lib/types";

export function StreakCard({ character }: { character: Character }) {
  const days = character.streakDays ?? 0;
  const hasStreak = days > 0;

  return (
    <div
      className={`card px-4 py-3 flex items-center gap-3 ${hasStreak ? "border-uri-gold/30 streak-glow" : ""}`}
    >
      <span className="text-2xl" aria-hidden>🔥</span>
      <div>
        <div className="font-semibold text-white">{days}-day streak</div>
        <div className="text-xs text-white/50">
          {hasStreak ? "Keep logging to extend your streak." : "Earn 20+ XP per day to start a streak."}
        </div>
      </div>
    </div>
  );
}
