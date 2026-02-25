"use client";

import { useMemo } from "react";
import { getDailyQuests } from "@/lib/quests";
import { getLogsByActivity } from "@/lib/store";
import type { Character } from "@/lib/types";
import type { DailyQuest } from "@/lib/types";

function getProgressForQuest(quest: DailyQuest, logsByActivity: Record<string, number>): number {
  const activityIds: string[] = [];
  if (quest.stat === "strength") activityIds.push("gym");
  if (quest.stat === "stamina") activityIds.push("run");
  if (quest.stat === "knowledge") activityIds.push("study", "exam-prep", "group-study");
  if (quest.stat === "social") activityIds.push("club", "group-study");
  if (quest.stat === "focus") activityIds.push("deep-focus", "meditate");
  let count = 0;
  activityIds.forEach((id) => { count += logsByActivity[id] ?? 0; });
  return count;
}

export function DailyQuests({ character }: { character: Character }) {
  const quests = useMemo(() => getDailyQuests(), []);
  const logsByActivity = getLogsByActivity(character.id);

  return (
    <section className="card p-4 sm:p-5">
      <h3 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
        <span aria-hidden>📋</span> Daily Quests
      </h3>
      <p className="text-xs text-white/50 mb-3">Complete activities to earn bonus XP.</p>
      <div className="space-y-2">
        {quests.map((q) => {
          const current = getProgressForQuest(q, logsByActivity);
          const done = current >= q.targetCount;
          return (
            <div
              key={q.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${done ? "bg-uri-keaney/10 border-uri-keaney/30" : "bg-white/5 border-white/10"}`}
            >
              <span className="text-2xl">{q.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{q.title}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  {current} / {q.targetCount} · +{q.xpReward} XP
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-uri-keaney transition-all"
                    style={{ width: `${Math.min(100, (current / q.targetCount) * 100)}%` }}
                  />
                </div>
              </div>
              {done && <span className="text-uri-keaney text-lg">✓</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
