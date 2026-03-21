"use client";

import { useMemo } from "react";
import type { Character } from "@/lib/types";
import { loadCampusBossEvent, campusBossPercentHp, topContributors } from "@/lib/campusBossEvent";
import { getCharacterById } from "@/lib/friendsStore";

export function CampusBossRaid({ character }: { character: Character }) {
  const state = useMemo(() => loadCampusBossEvent(), [character.totalXP, character.id]);
  const pctRemaining = campusBossPercentHp(state);
  const damagedPct = Math.max(0, Math.min(100, 100 - pctRemaining));
  const top = topContributors(state, 6);

  return (
    <div className="rounded-2xl border-2 border-uri-gold/50 overflow-hidden bg-gradient-to-b from-uri-gold/10 to-uri-navy/90">
      <div className="px-4 py-3 border-b border-uri-gold/30 flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          🌐
        </span>
        <div>
          <h4 className="font-display font-bold text-white text-sm">Campus-wide boss event</h4>
          <p className="text-[10px] text-white/55">Everyone&apos;s logs chip in. Resets each Monday.</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-white font-semibold text-center">{state.name}</p>
        <div className="h-4 rounded-full bg-black/40 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-uri-gold via-amber-400 to-orange-500 transition-all duration-500"
            style={{ width: `${damagedPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-white/60 font-mono">
          <span>Raid damage {damagedPct.toFixed(1)}%</span>
          <span>HP left ~{pctRemaining.toFixed(1)}%</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-uri-gold/90 font-bold mb-2">Top contributors (this device)</p>
          <ol className="space-y-1">
            {top.length === 0 ? (
              <li className="text-xs text-white/45">Log any activity — you&apos;ll show up here.</li>
            ) : (
              top.map((t, i) => {
                const c = getCharacterById(t.userId);
                const label = c?.name ?? t.userId.slice(0, 8);
                return (
                  <li key={t.userId} className="flex justify-between text-xs text-white/85">
                    <span>
                      {i + 1}. {label}
                    </span>
                    <span className="font-mono text-uri-keaney">{t.damage.toLocaleString()} dmg</span>
                  </li>
                );
              })
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
