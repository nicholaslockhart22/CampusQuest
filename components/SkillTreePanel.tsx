"use client";

import { useState, useCallback } from "react";
import type { Character } from "@/lib/types";
import { SKILL_TREE_NODES, availableSkillPoints } from "@/lib/skillTree";
import { unlockSkillNode } from "@/lib/store";

export function SkillTreePanel({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  const unlocked = character.unlockedSkillNodes ?? [];
  const pts = availableSkillPoints(character.level, unlocked.length);

  const tryUnlock = useCallback(
    (id: string) => {
      setErr(null);
      const next = unlockSkillNode(character.id, id);
      if (!next) {
        setErr("Need more levels, prerequisites, or skill points.");
        return;
      }
      onRefresh?.();
    },
    [character.id, onRefresh]
  );

  return (
    <section className="card p-4 sm:p-5 border border-uri-keaney/25">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-uri-keaney/20 border border-uri-keaney/40 flex items-center justify-center text-xl">🧠</div>
        <div>
          <h3 className="font-display font-bold text-white text-lg">Skill tree</h3>
          <p className="text-xs text-white/55 mt-0.5">
            Earn <span className="text-uri-keaney font-semibold">1 skill point per level</span> (after Lv.1). Unlock paths for real XP bonuses on campus activities.
          </p>
          <p className="text-sm text-uri-gold font-bold mt-2">Skill points available: {pts}</p>
        </div>
      </div>
      {err && <p className="text-red-300/90 text-xs mb-3">{err}</p>}
      <ul className="space-y-2">
        {SKILL_TREE_NODES.map((n) => {
          const has = unlocked.includes(n.id);
          const needs = n.requires.every((r) => unlocked.includes(r));
          const canBuy = !has && needs && pts > 0;
          return (
            <li
              key={n.id}
              className={`rounded-xl border px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 ${
                has ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-lg" aria-hidden>
                  {n.icon}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{n.label}</div>
                  <div className="text-[11px] text-white/50">{n.description}</div>
                </div>
              </div>
              {has ? (
                <span className="text-xs font-bold text-emerald-300">Unlocked</span>
              ) : (
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => tryUnlock(n.id)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-uri-keaney/80 text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-uri-keaney"
                >
                  Unlock (1 pt)
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
