"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Character } from "@/lib/types";
import { claimMiniGameBonusXp } from "@/lib/store";
import { playXpDing } from "@/lib/playGameSound";
import { todayString } from "@/lib/dateUtils";

const WINDOW_MS = 10_000;
const TARGET_TAPS = 22;

export function MiniGameFocus({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const [phase, setPhase] = useState<"idle" | "running" | "done_win" | "done_fail">("idle");
  const [taps, setTaps] = useState(0);
  const [leftMs, setLeftMs] = useState(WINDOW_MS);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const tick = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    const left = Math.max(0, WINDOW_MS - elapsed);
    setLeftMs(left);
    if (left <= 0) {
      stopTimer();
      setPhase((p) => (p === "running" ? "done_fail" : p));
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [stopTimer]);

  const start = useCallback(() => {
    setTaps(0);
    setPhase("running");
    startRef.current = performance.now();
    setLeftMs(WINDOW_MS);
    stopTimer();
    rafRef.current = requestAnimationFrame(tick);
  }, [stopTimer, tick]);

  useEffect(() => {
    if (phase !== "running" || taps < TARGET_TAPS) return;
    stopTimer();
    setPhase("done_win");
    const updated = claimMiniGameBonusXp(character.id);
    if (updated) {
      playXpDing();
      onRefresh?.();
    }
  }, [phase, taps, character.id, onRefresh, stopTimer]);

  const onTap = useCallback(() => {
    if (phase !== "running") return;
    setTaps((t) => t + 1);
  }, [phase]);

  const alreadyDone = character.lastMiniGameXpDay === todayString();

  if (alreadyDone && phase === "idle") {
    return (
      <div className="card p-4 border border-uri-purple/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⚡</span>
          <h3 className="font-display font-bold text-white text-sm">Focus burst</h3>
        </div>
        <p className="text-xs text-emerald-300/90">You already cleared today&apos;s burst (+18 XP). Come back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="card p-4 border border-uri-purple/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">⚡</span>
        <h3 className="font-display font-bold text-white text-sm">Focus burst (mini-game)</h3>
      </div>
      <p className="text-xs text-white/55 mb-3">
        Tap fast: {TARGET_TAPS}+ taps in {WINDOW_MS / 1000}s for <span className="text-uri-gold font-bold">+18 XP</span> (once per day).
      </p>
      {phase === "idle" && (
        <button
          type="button"
          onClick={start}
          className="w-full py-3 rounded-xl bg-uri-purple/70 text-white font-bold text-sm hover:bg-uri-purple"
        >
          Start burst
        </button>
      )}
      {phase === "running" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-white/70">
            <span>
              Taps: {taps}/{TARGET_TAPS}
            </span>
            <span>{(leftMs / 1000).toFixed(1)}s</span>
          </div>
          <button
            type="button"
            onClick={onTap}
            className="w-full py-12 rounded-2xl bg-gradient-to-br from-uri-keaney/40 to-uri-navy border-2 border-uri-keaney/50 text-white font-black text-lg active:scale-[0.98] transition-transform cq-tap-pulse"
          >
            TAP!
          </button>
        </div>
      )}
      {phase === "done_fail" && (
        <div className="space-y-2">
          <p className="text-xs text-white/60 text-center">Time&apos;s up — try again!</p>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="w-full py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      )}
      {phase === "done_win" && <p className="text-xs text-uri-gold font-bold text-center">+18 XP secured. Nice reflexes!</p>}
    </div>
  );
}
