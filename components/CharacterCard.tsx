"use client";

import { useState } from "react";
import type { Character, StatKey } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS } from "@/lib/types";
import { xpProgressInLevel } from "@/lib/level";
import { updateCharacter } from "@/lib/store";

const AVATARS = ["🎓", "🦉", "🐏", "⚡", "🌟", "🔥", "📚", "🏃", "🎯"];

/** Progress bar fill colors – Keaney/accent for cohesion with URI palette */
const STAT_FILL_COLORS: Record<StatKey, string> = {
  strength: "bg-amber-400",
  stamina: "bg-uri-teal",
  knowledge: "bg-uri-keaney",
  social: "bg-uri-green",
  focus: "bg-uri-purple",
};

export function CharacterCard({
  character,
  onRefresh,
}: {
  character: Character;
  onRefresh?: () => void;
}) {
  const [editingAvatar, setEditingAvatar] = useState(false);
  const { current, needed } = xpProgressInLevel(character.totalXP);
  const xpPct = Math.min(100, (current / needed) * 100);

  function handleAvatarSelect(avatar: string) {
    updateCharacter({ avatar });
    setEditingAvatar(false);
    onRefresh?.();
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-uri-keaney/25 to-uri-navy flex items-center justify-center text-4xl border border-uri-keaney/40"
            aria-hidden
          >
            {character.avatar}
          </div>
          <button
            type="button"
            onClick={() => setEditingAvatar(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-uri-keaney text-white border-2 border-uri-navy flex items-center justify-center text-sm shadow-md hover:bg-uri-keaney/90 focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:ring-offset-2 focus:ring-offset-uri-navy"
            aria-label="Edit avatar"
            title="Edit avatar"
          >
            ✏️
          </button>
          {editingAvatar && (
            <>
              <div
                className="fixed inset-0 z-20 bg-black/60"
                aria-hidden
                onClick={() => setEditingAvatar(false)}
              />
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[min(18rem,90vw)] p-4 rounded-2xl bg-uri-navy border border-uri-keaney/30 shadow-xl card">
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">
                  Choose avatar
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => handleAvatarSelect(a)}
                      className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                        character.avatar === a
                          ? "border-uri-keaney bg-uri-keaney/25 ring-2 ring-uri-keaney/40"
                          : "border-white/25 bg-white/10 hover:border-uri-keaney/50 hover:bg-white/15"
                      }`}
                      aria-pressed={character.avatar === a}
                      aria-label={`Select avatar ${a}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAvatar(false)}
                  className="mt-3 w-full py-2 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-lg text-white truncate">
            {character.name}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-uri-keaney font-mono font-semibold text-sm bg-uri-keaney/15 px-2 py-0.5 rounded-lg">
              Lv.{character.level}
            </span>
            <span className="text-white/50 text-sm">@{character.username}</span>
            <span className="text-white/40 text-sm font-mono">{character.totalXP} XP</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Level progress</span>
              <span className="font-mono text-uri-keaney/90">{current} / {needed} XP</span>
            </div>
            <div className="stat-bar bg-white/20">
              <div className="stat-fill bg-uri-keaney" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-uri-keaney/20">
        <h3 className="text-xs font-semibold text-uri-keaney/90 uppercase tracking-wider mb-3">
          Stats
        </h3>
        <div className="grid gap-3">
          {STAT_KEYS.map((key) => {
            const value = character.stats[key] ?? 0;
            const max = 100;
            const pct = Math.min(100, (value / max) * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-lg w-6" title={STAT_LABELS[key]}>
                  {STAT_ICONS[key]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-white/70">{STAT_LABELS[key]}</span>
                    <span className="font-mono text-white/90">{value}</span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className={`stat-fill ${STAT_FILL_COLORS[key]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {character.achievements && character.achievements.length > 0 && (
        <div className="mt-5 pt-4 border-t border-uri-keaney/20">
          <h3 className="text-xs font-semibold text-uri-keaney/90 uppercase tracking-wider mb-2">
            Achievements
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {character.achievements.map((a) => (
              <span
                key={a}
                className="text-xs px-2.5 py-1 rounded-full bg-uri-gold/20 text-uri-gold border border-uri-gold/40"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
