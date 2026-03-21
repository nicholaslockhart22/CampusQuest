"use client";

import type { Character } from "@/lib/types";
import { getTodaysSurpriseQuest } from "@/lib/surpriseQuests";
import { todayString } from "@/lib/dateUtils";

export function SurpriseQuestBanner({ character }: { character: Character }) {
  const q = getTodaysSurpriseQuest(character.id);
  const done = character.lastSurpriseQuestCompletedDay === todayString();

  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        done ? "border-emerald-500/40 bg-emerald-500/10" : "border-uri-gold/50 bg-gradient-to-r from-uri-gold/15 to-transparent"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{q.icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-uri-gold">Surprise quest (daily)</span>
      </div>
      <p className="text-sm font-semibold text-white">{q.title}</p>
      <p className="text-xs text-white/60 mt-1">{q.description}</p>
      {done ? (
        <p className="text-xs text-emerald-300 font-bold mt-2">Completed today — +{q.xpReward} XP was added when you matched it.</p>
      ) : (
        <p className="text-xs text-white/50 mt-2">Complete it by logging a matching activity. Bonus stacks on top of multipliers.</p>
      )}
    </div>
  );
}
