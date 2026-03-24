"use client";

import { useState, useCallback } from "react";
import type { Character } from "@/lib/types";
import { SKILL_TREE_NODES, availableSkillPoints } from "@/lib/skillTree";
import { unlockSkillNode } from "@/lib/store";

export function SkillTreePanel({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const [open, setOpen] = useState(false);
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
    <section className="overflow-hidden rounded-xl border border-uri-keaney/25 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-white/[0.04] sm:gap-4 sm:px-5 sm:py-4 ${
          open ? "border-b border-white/10" : "border-b border-transparent"
        }`}
        aria-expanded={open}
        aria-controls="skill-tree-panel"
        id="skill-tree-toggle"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-uri-keaney/40 bg-uri-keaney/20 text-lg shadow-inner sm:h-11 sm:w-11 sm:text-xl">
          🧠
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-display text-[15px] font-bold tracking-tight text-white sm:text-base">Skill tree</span>
          <p className="mt-0.5 text-xs leading-relaxed text-white/55 sm:text-[13px]">
            <span className="font-semibold text-uri-gold">{pts}</span> skill point{pts !== 1 ? "s" : ""} available
            {open ? null : (
              <span className="text-white/40"> · Tap to unlock nodes</span>
            )}
          </p>
        </div>
        <span className="flex-shrink-0 text-lg text-uri-keaney/90 tabular-nums" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div
          id="skill-tree-panel"
          role="region"
          aria-labelledby="skill-tree-toggle"
          className="border-t border-white/[0.08] bg-black/20 px-3 py-4 sm:px-5 sm:py-5"
        >
          <p className="mb-4 text-xs leading-relaxed text-white/55 sm:text-[13px] sm:text-white/50">
            Earn <span className="font-semibold text-uri-keaney">1 skill point per level</span> (after Lv.1). Unlock paths
            for real XP bonuses on campus activities.
          </p>
          {err && <p className="mb-3 text-xs text-red-300/90">{err}</p>}
          <ul className="space-y-2">
            {SKILL_TREE_NODES.map((n) => {
              const has = unlocked.includes(n.id);
              const needs = n.requires.every((r) => unlocked.includes(r));
              const canBuy = !has && needs && pts > 0;
              return (
                <li
                  key={n.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                    has ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
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
                      className="rounded-lg bg-uri-keaney/80 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-uri-keaney disabled:pointer-events-none disabled:opacity-40"
                    >
                      Unlock (1 pt)
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
