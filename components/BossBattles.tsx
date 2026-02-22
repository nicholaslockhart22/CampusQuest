"use client";

import { useState, useCallback } from "react";
import { getSampleBosses, getBossTypeLabel } from "@/lib/bosses";
import { getBossProgress, getCurrentBoss, startBossBattle } from "@/lib/store";
import type { Boss } from "@/lib/types";
import type { Character } from "@/lib/types";

function formatDue(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days < 0) return "Past due";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function BossBattles({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const [bossName, setBossName] = useState("");
  const [bossHp, setBossHp] = useState("250");
  const currentBoss = getCurrentBoss();
  const bosses = getSampleBosses();
  const progress = getBossProgress(character.id);

  const handleStartBoss = useCallback(() => {
    const name = bossName.trim() || "Midterm Boss";
    const hp = Math.max(1, parseInt(bossHp, 10) || 250);
    startBossBattle(name, hp);
    setBossName("");
    setBossHp("250");
    onRefresh?.();
  }, [bossName, bossHp, onRefresh]);

  return (
    <section className="rounded-2xl bg-white/[0.08] border border-white/20 p-4 shadow-xl shadow-black/20">
      <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
        <span>⚔️</span> Boss Battles
      </h3>
      <p className="text-xs text-white/50 mb-3">Study sessions deal damage (Knowledge + Focus + minutes). Defeat for +100 XP.</p>

      {/* Current boss (Python-style: one active boss) */}
      {currentBoss && (
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border mb-3 ${currentBoss.active ? "bg-white/5 border-white/10" : "bg-uri-green/10 border-uri-green/30"}`}
        >
          <span className="text-2xl">🧟</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm flex items-center gap-2">
              {currentBoss.name}
              {!currentBoss.active && <span className="text-xs text-uri-green">✓ Defeated</span>}
            </div>
            {currentBoss.active && (
              <div className="mt-1.5">
                <div className="flex justify-between text-xs text-white/50 mb-0.5">
                  <span>HP</span>
                  <span className="font-mono">{currentBoss.hp} / {currentBoss.maxHp}</span>
                </div>
                <div className="stat-bar h-1.5">
                  <div
                    className="stat-fill bg-red-500"
                    style={{ width: `${Math.min(100, (currentBoss.hp / currentBoss.maxHp) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-uri-gold font-mono font-semibold">+100 XP</div>
            <div className="text-xs text-white/50">on defeat</div>
          </div>
        </div>
      )}

      {/* Start new boss (show when no boss or current defeated) */}
      {(!currentBoss || !currentBoss.active) && (
        <div className="p-3 rounded-xl border border-white/10 bg-white/5 mb-3 space-y-2">
          <div className="text-sm font-medium text-white">Start boss battle</div>
          <input
            type="text"
            value={bossName}
            onChange={(e) => setBossName(e.target.value)}
            placeholder="e.g. MTH215 Midterm"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm"
          />
          <input
            type="number"
            min={1}
            value={bossHp}
            onChange={(e) => setBossHp(e.target.value)}
            placeholder="HP (default 250)"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-mono"
          />
          <button
            type="button"
            onClick={handleStartBoss}
            className="w-full py-2 rounded-lg bg-uri-gold text-uri-navy font-semibold hover:bg-uri-gold/90"
          >
            Start battle
          </button>
        </div>
      )}

      {/* Predefined bosses (reference) */}
      <div className="space-y-2">
        {bosses.map((boss: Boss, i: number) => {
          const prog = progress[i];
          const defeated = prog?.defeated ?? false;
          const currentHp = prog?.currentHp ?? boss.bossHp;
          const hpPct = defeated ? 0 : Math.min(100, (currentHp / boss.bossHp) * 100);
          return (
            <div
              key={boss.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${defeated ? "bg-uri-green/10 border-uri-green/30" : "bg-white/5 border-white/10 hover:border-uri-gold/30"}`}
            >
              <span className="text-2xl">{boss.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm flex items-center gap-2">
                  {boss.name}
                  {defeated && <span className="text-xs text-uri-green">✓ Defeated</span>}
                </div>
                <div className="text-xs text-white/50">{boss.description}</div>
                {!defeated && (
                  <div className="mt-1.5">
                    <div className="flex justify-between text-xs text-white/50 mb-0.5">
                      <span>HP</span>
                      <span className="font-mono">{currentHp} / {boss.bossHp}</span>
                    </div>
                    <div className="stat-bar h-1.5">
                      <div
                        className="stat-fill bg-red-500"
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-uri-gold/20 text-uri-gold">
                    {getBossTypeLabel(boss.type)}
                  </span>
                  <span className="text-xs text-white/40">{formatDue(boss.dueDate)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-uri-gold font-mono font-semibold">+{boss.xpReward} XP</div>
                <div className="text-xs text-white/50">on defeat</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
