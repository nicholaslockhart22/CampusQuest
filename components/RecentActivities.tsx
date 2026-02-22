"use client";

import { getActivityLogs } from "@/lib/store";
import { getActivityById } from "@/lib/activities";

const N = 10;

export function RecentActivities({ characterId }: { characterId: string }) {
  const logs = getActivityLogs(characterId).slice(0, N);
  if (logs.length === 0) {
    return (
      <section className="rounded-2xl bg-white/[0.08] border border-white/20 p-4 shadow-xl shadow-black/20">
        <h3 className="font-display font-semibold text-white mb-2">📝 Recent activities</h3>
        <p className="text-sm text-white/50">No activities logged yet.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl bg-white/[0.08] border border-white/20 p-4 shadow-xl shadow-black/20">
      <h3 className="font-display font-semibold text-white mb-3">📝 Recent activities</h3>
      <ul className="space-y-1.5">
        {logs.map((log) => {
          const def = getActivityById(log.activityId);
          const label = def?.label ?? log.activityId;
          const date = new Date(log.createdAt);
          const timeStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
          return (
            <li key={log.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm py-1.5 border-b border-white/5 last:border-0">
              <span className="text-white/90 min-w-0 truncate">{label}</span>
              <span className="text-uri-keaney font-mono text-xs">+{log.xpEarned ?? 0} XP</span>
              {log.minutes != null && <span className="text-white/50 text-xs">{log.minutes} min</span>}
              <span className="text-white/40 text-xs ml-auto">{timeStr}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
