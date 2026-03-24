"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Character, StatKey } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS } from "@/lib/types";
import { grantMiniGameTrainingXp } from "@/lib/store";
import { canPlayMiniGameTraining, getMiniGameTrainingSummary } from "@/lib/miniGameTraining";
import { playXpDing } from "@/lib/playGameSound";

const REP_TOTAL = 4;
const SPRINT_MS = 3000;
const DODGE_MS = 6000;

function RepTimingPanel({ onDone, onCancel }: { onDone: (xp: number) => void; onCancel: () => void }) {
  const [rep, setRep] = useState(0);
  const [perfect, setPerfect] = useState(0);
  const posRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    const loop = () => {
      const now = performance.now();
      const t = (now - startRef.current) / 1000;
      posRef.current = (Math.sin(t * Math.PI * 1.15) + 1) / 2;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const [, setHud] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHud((x) => x + 1), 32);
    return () => clearInterval(id);
  }, []);

  const p = posRef.current;
  const inGreen = p >= 0.4 && p <= 0.62;

  const tap = () => {
    if (rep >= REP_TOTAL) return;
    const ok = posRef.current >= 0.4 && posRef.current <= 0.62;
    const nextPerfect = perfect + (ok ? 1 : 0);
    setPerfect(nextPerfect);
    const next = rep + 1;
    setRep(next);
    if (next >= REP_TOTAL) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      const xp = nextPerfect === REP_TOTAL ? 25 : nextPerfect >= 2 ? 16 : 10;
      onDone(xp);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/35 bg-black/30 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold text-white">Rep timing</p>
        <button type="button" onClick={onCancel} className="text-xs text-white/50 hover:text-white">
          Cancel
        </button>
      </div>
      <p className="text-xs text-white/55">Tap when the marker is in the green zone. {REP_TOTAL} reps.</p>
      <div className="relative h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden">
        <div className="absolute inset-y-2 left-[40%] right-[38%] rounded-lg bg-emerald-500/35 border border-emerald-400/50" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-8 rounded-md bg-uri-gold shadow-[0_0_12px_rgba(197,160,40,0.6)] -ml-1.5"
          style={{ left: `${p * 100}%` }}
        />
      </div>
      <p className="text-center text-xs font-mono text-white/70">
        Rep {Math.min(rep + 1, REP_TOTAL)}/{REP_TOTAL} · Perfect {perfect}
        {inGreen ? <span className="text-emerald-300 ml-2">· GREEN</span> : null}
      </p>
      <button
        type="button"
        onClick={tap}
        className="w-full py-4 rounded-xl bg-gradient-to-b from-amber-600/90 to-amber-800/90 text-white font-black text-lg border border-amber-400/40 active:scale-[0.98]"
      >
        REP!
      </button>
    </div>
  );
}

function SprintTapPanel({ onDone, onCancel }: { onDone: (xp: number) => void; onCancel: () => void }) {
  const [phase, setPhase] = useState<"ready" | "go" | "done">("ready");
  const [taps, setTaps] = useState(0);
  const [left, setLeft] = useState(SPRINT_MS);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const tapsRef = useRef(0);
  const scoredRef = useRef(false);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = () => {
    scoredRef.current = false;
    tapsRef.current = 0;
    setTaps(0);
    setPhase("go");
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const l = Math.max(0, SPRINT_MS - elapsed);
      setLeft(l);
      if (l <= 0) {
        stop();
        setPhase("done");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (phase !== "done" || scoredRef.current) return;
    scoredRef.current = true;
    const xp = Math.min(28, Math.max(8, 6 + Math.floor(tapsRef.current * 0.65)));
    onDone(xp);
  }, [phase, onDone]);

  if (phase === "ready") {
    return (
      <div className="rounded-xl border border-teal-500/35 bg-black/30 p-4 space-y-3">
        <div className="flex justify-between">
          <p className="text-sm font-bold text-white">Sprint tap</p>
          <button type="button" onClick={onCancel} className="text-xs text-white/50 hover:text-white">
            Cancel
          </button>
        </div>
        <p className="text-xs text-white/55">Tap as fast as you can for {SPRINT_MS / 1000} seconds. More taps = more XP.</p>
        <button
          type="button"
          onClick={start}
          className="w-full py-3 rounded-xl bg-teal-600/90 text-white font-bold text-sm hover:bg-teal-500"
        >
          Go
        </button>
      </div>
    );
  }

  if (phase === "go") {
    return (
      <div className="rounded-xl border border-teal-500/35 bg-black/30 p-4 space-y-3">
        <p className="text-center text-xs font-mono text-white/70">{(left / 1000).toFixed(2)}s · Taps {taps}</p>
        <button
          type="button"
          onClick={() => {
            tapsRef.current += 1;
            setTaps((t) => t + 1);
          }}
          className="w-full py-14 rounded-2xl bg-gradient-to-br from-teal-600/50 to-uri-navy border-2 border-teal-400/40 text-white font-black text-xl active:scale-[0.98]"
        >
          TAP!
        </button>
      </div>
    );
  }

  return <p className="text-xs text-uri-gold text-center py-4">Scoring…</p>;
}

const QUIZ_BANK: { q: string; options: string[]; correct: number }[] = [
  { q: "What is 7 × 8?", options: ["54", "56", "63"], correct: 1 },
  { q: "Capital of Rhode Island?", options: ["Newport", "Providence", "Warwick"], correct: 1 },
  { q: "H2O is commonly known as…", options: ["Oxygen", "Water", "Salt"], correct: 1 },
  { q: "How many days in a leap-year February?", options: ["28", "29", "30"], correct: 1 },
  { q: 'Synonym for "brief"?', options: ["Verbose", "Concise", "Ancient"], correct: 1 },
  { q: "CPU stands for…", options: ["Central processing unit", "Computer personal unit", "Core power utility"], correct: 0 },
];

function KnowledgeQuizPanel({ onDone, onCancel }: { onDone: (xp: number) => void; onCancel: () => void }) {
  const [idx, setIdx] = useState(0);
  const [wrongFeedback, setWrongFeedback] = useState<{ correctText: string; chosenText: string } | null>(null);
  const totalRef = useRef(0);
  const pair = useMemo(() => {
    const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5);
    return [shuffled[0]!, shuffled[1]!] as [(typeof QUIZ_BANK)[0], (typeof QUIZ_BANK)[0]];
  }, []);

  const cur = pair[idx];
  if (!cur) return null;

  const advanceOrFinish = () => {
    if (idx >= 1) {
      onDone(totalRef.current);
      return;
    }
    setIdx(1);
  };

  const pick = (i: number) => {
    const correct = i === cur.correct;
    const add = correct ? 20 : 5;
    totalRef.current += add;
    if (!correct) {
      setWrongFeedback({
        correctText: cur.options[cur.correct] ?? "",
        chosenText: cur.options[i] ?? "",
      });
      return;
    }
    advanceOrFinish();
  };

  const continueAfterWrong = () => {
    setWrongFeedback(null);
    advanceOrFinish();
  };

  return (
    <div className="rounded-xl border border-uri-keaney/35 bg-black/30 p-4 space-y-3">
      <div className="flex justify-between">
        <p className="text-sm font-bold text-white">Quick quiz</p>
        <button type="button" onClick={onCancel} className="text-xs text-white/50 hover:text-white">
          Cancel
        </button>
      </div>
      {wrongFeedback ? (
        <>
          <p className="text-xs text-white/55">Question {idx + 1}/2</p>
          <div className="rounded-lg border border-amber-500/35 bg-amber-950/30 px-3 py-3 space-y-2">
            <p className="text-sm font-semibold text-amber-200/95">Not quite.</p>
            <p className="text-xs text-white/70">
              You picked: <span className="text-white/90 font-medium">{wrongFeedback.chosenText}</span>
            </p>
            <p className="text-sm text-white/90">
              Correct answer:{" "}
              <span className="font-semibold text-emerald-300">{wrongFeedback.correctText}</span>
            </p>
            <p className="text-xs text-uri-gold/90">+5 XP for trying — keep going.</p>
          </div>
          <button
            type="button"
            onClick={continueAfterWrong}
            className="w-full py-2.5 rounded-xl bg-uri-keaney/80 text-white text-sm font-bold hover:bg-uri-keaney"
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-white/55">
            Question {idx + 1}/2 · Correct +20 XP · Wrong +5 XP
          </p>
          <p className="text-sm text-white font-medium leading-snug">{cur.q}</p>
          <div className="space-y-2">
            {cur.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className="w-full text-left py-2.5 px-3 rounded-lg border border-white/15 bg-white/[0.06] text-sm text-white/90 hover:bg-uri-keaney/20 hover:border-uri-keaney/40"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const SOCIAL_SCENARIOS: {
  prompt: string;
  choices: { text: string; tier: "best" | "ok" | "weak" }[];
}[] = [
  {
    prompt: "You meet someone at a career fair. They ask what you're studying. You want to sound confident.",
    choices: [
      { text: "Share your major, one concrete project, and ask what drew them to the fair.", tier: "best" },
      { text: "Give your major only and wait.", tier: "ok" },
      { text: "Apologize for bothering them and walk away.", tier: "weak" },
    ],
  },
  {
    prompt: "A classmate forgot the assignment deadline. They DM you last minute.",
    choices: [
      { text: "Share the deadline kindly and offer one quick tip if you have time.", tier: "best" },
      { text: "Reply with only the due date.", tier: "ok" },
      { text: "Ignore the message.", tier: "weak" },
    ],
  },
];

function SocialMatchPanel({ onDone, onCancel }: { onDone: (xp: number) => void; onCancel: () => void }) {
  const scenario = useMemo(() => SOCIAL_SCENARIOS[Math.floor(Math.random() * SOCIAL_SCENARIOS.length)]!, []);
  const xpFor: Record<string, number> = { best: 25, ok: 10, weak: 8 };

  return (
    <div className="rounded-xl border border-emerald-500/35 bg-black/30 p-4 space-y-3">
      <div className="flex justify-between">
        <p className="text-sm font-bold text-white">Conversation match</p>
        <button type="button" onClick={onCancel} className="text-xs text-white/50 hover:text-white">
          Cancel
        </button>
      </div>
      <p className="text-xs text-white/55">Pick the strongest response.</p>
      <p className="text-sm text-white/90 leading-relaxed">{scenario.prompt}</p>
      <div className="space-y-2">
        {scenario.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onDone(xpFor[c.tier])}
            className="w-full text-left py-2.5 px-3 rounded-lg border border-white/15 bg-white/[0.06] text-sm text-white/90 hover:bg-emerald-500/15 hover:border-emerald-400/35"
          >
            {c.text}
          </button>
        ))}
      </div>
    </div>
  );
}

type Obstacle = { id: number; lane: number; y: number };
const DODGE_LANES = 3;

function useArrowKeys(onLeft: () => void, onRight: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onLeft();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onRight();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [enabled, onLeft, onRight]);
}

function FocusDodgePanel({ onDone, onCancel }: { onDone: (xp: number) => void; onCancel: () => void }) {
  const [lane, setLane] = useState(1);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);
  const [, setTick] = useState(0);
  const obsRef = useRef<Obstacle[]>([]);
  const nextId = useRef(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const laneRef = useRef(lane);
  laneRef.current = lane;

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    startRef.current = performance.now();
    let frame = 0;
    const step = () => {
      frame++;
      if (frame % 2 === 0) setTick((t) => t + 1);
      const now = performance.now();
      const elapsed = now - startRef.current;
      if (elapsed >= DODGE_MS) {
        stop();
        setDone(true);
        return;
      }
      const list = obsRef.current;
      if (Math.random() < 0.028) {
        list.push({ id: nextId.current++, lane: Math.floor(Math.random() * DODGE_LANES), y: -0.1 });
      }
      const playerY = 0.86;
      const L = laneRef.current;
      let addHit = 0;
      obsRef.current = list
        .map((o) => ({ ...o, y: o.y + 0.01 }))
        .filter((o) => {
          if (o.y > 1.08) return false;
          if (o.y > playerY - 0.05 && o.y < playerY + 0.07 && o.lane === L) {
            addHit += 1;
            return false;
          }
          return true;
        });
      if (addHit) setHits((h) => h + addHit);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => stop();
  }, [stop]);

  const dodgeScoredRef = useRef(false);
  useEffect(() => {
    if (!done || dodgeScoredRef.current) return;
    dodgeScoredRef.current = true;
    const clean = hits <= 1;
    onDone(clean ? 30 : Math.max(12, 22 - hits * 3));
  }, [done, hits, onDone]);

  const move = useCallback(
    (d: -1 | 1) => setLane((l) => Math.max(0, Math.min(DODGE_LANES - 1, l + d))),
    []
  );
  useArrowKeys(() => move(-1), () => move(1), !done);

  return (
    <div className="rounded-xl border border-violet-500/35 bg-black/30 p-4 space-y-3">
      <div className="flex justify-between">
        <p className="text-sm font-bold text-white">Focus dodge</p>
        <button type="button" onClick={onCancel} className="text-xs text-white/50 hover:text-white">
          Cancel
        </button>
      </div>
      <p className="text-xs text-white/55">Dodge for {(DODGE_MS / 1000).toFixed(0)}s. Clean runs earn more XP. Hits: {hits}</p>
      <div className="relative mx-auto w-full max-w-[220px] aspect-[3/4] rounded-xl bg-gradient-to-b from-uri-navy to-black/60 border border-white/15 overflow-hidden">
        {obsRef.current.map((o) => (
          <div
            key={o.id}
            className="absolute w-[28%] h-[7%] rounded-md bg-red-500/75 border border-red-300/40"
            style={{
              left: `${(o.lane * 100) / DODGE_LANES + 100 / (2 * DODGE_LANES)}%`,
              top: `${o.y * 100}%`,
              transform: "translate(-50%, 0)",
            }}
          />
        ))}
        <div
          className="absolute w-[28%] h-[9%] rounded-lg bg-uri-keaney/85 border border-uri-keaney"
          style={{
            left: `${(lane * 100) / DODGE_LANES + 100 / (2 * DODGE_LANES)}%`,
            bottom: "6%",
            transform: "translateX(-50%)",
          }}
        />
      </div>
      <div className="flex gap-2 justify-center">
        <button type="button" onClick={() => move(-1)} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold border border-white/20">
          ◀
        </button>
        <button type="button" onClick={() => move(1)} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold border border-white/20">
          ▶
        </button>
      </div>
      <p className="text-[10px] text-center text-white/40">← → keys</p>
    </div>
  );
}

export function DailyTrainingGames({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const [active, setActive] = useState<StatKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const summary = useMemo(() => getMiniGameTrainingSummary(character), [character]);
  const canPlay = useMemo(() => canPlayMiniGameTraining(character), [character]);

  const finish = useCallback(
    (stat: StatKey, baseXp: number) => {
      const r = grantMiniGameTrainingXp(character.id, stat, baseXp);
      if (r) {
        playXpDing();
        const parts = [`+${r.sessionXp} XP`];
        for (const e of r.extras) parts.push(`${e.label} +${e.xp}`);
        setToast(parts.join(" · "));
        setTimeout(() => setToast(null), 4500);
        onRefresh?.();
      }
      setActive(null);
    },
    [character.id, onRefresh]
  );

  if (active === "strength") {
    return (
      <div className="card p-4 border border-amber-500/30">
        <RepTimingPanel onCancel={() => setActive(null)} onDone={(xp) => finish("strength", xp)} />
      </div>
    );
  }
  if (active === "stamina") {
    return (
      <div className="card p-4 border border-teal-500/30">
        <SprintTapPanel onCancel={() => setActive(null)} onDone={(xp) => finish("stamina", xp)} />
      </div>
    );
  }
  if (active === "knowledge") {
    return (
      <div className="card p-4 border border-uri-keaney/30">
        <KnowledgeQuizPanel onCancel={() => setActive(null)} onDone={(xp) => finish("knowledge", xp)} />
      </div>
    );
  }
  if (active === "social") {
    return (
      <div className="card p-4 border border-emerald-500/30">
        <SocialMatchPanel onCancel={() => setActive(null)} onDone={(xp) => finish("social", xp)} />
      </div>
    );
  }
  if (active === "focus") {
    return (
      <div className="card p-4 border border-violet-500/30">
        <FocusDodgePanel onCancel={() => setActive(null)} onDone={(xp) => finish("focus", xp)} />
      </div>
    );
  }

  const exhausted = !canPlay;

  return (
    <div className="card p-4 border border-uri-gold/25 bg-gradient-to-br from-uri-gold/[0.06] to-transparent">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl" aria-hidden>
          🎮
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-white text-sm">Daily training</h3>
          <p className="text-xs text-white/55 mt-1">
            One game per stat — <span className="text-uri-gold font-semibold">{summary.playsLeft}</span> plays left today (max 2).
            Streak mult ×{summary.streakMult.toFixed(2)} after full training days.
          </p>
          <p className="text-[11px] text-white/45 mt-1">
            Second play today: <span className="text-emerald-300/90">+22 XP</span> “Daily training complete”. Hit all five stats this week:{" "}
            <span className="text-uri-gold/90">+50 XP</span> bonus once.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {STAT_KEYS.map((s) => {
          const hit = summary.weekStats.includes(s);
          return (
            <span
              key={s}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                hit ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200" : "border-white/15 text-white/45"
              }`}
            >
              {STAT_ICONS[s]} {STAT_LABELS[s]}
            </span>
          );
        })}
      </div>
      {toast ? (
        <p className="text-xs text-uri-gold font-semibold mb-3 px-1" role="status">
          {toast}
        </p>
      ) : null}
      {exhausted ? (
        <p className="text-xs text-white/55 py-2">You used both training sessions today. Come back tomorrow for more XP.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STAT_KEYS.map((stat) => (
            <button
              key={stat}
              type="button"
              onClick={() => setActive(stat)}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border border-white/12 bg-white/[0.05] hover:bg-uri-keaney/15 hover:border-uri-keaney/35 transition-colors text-center"
            >
              <span className="text-xl">{STAT_ICONS[stat]}</span>
              <span className="text-[11px] font-bold text-white/90">{STAT_LABELS[stat]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
