"use client";

import { useState } from "react";
import { ACTIVITIES, getActivityById } from "@/lib/activities";
import type { StatKey } from "@/lib/types";
import { STAT_ICONS } from "@/lib/types";
import type { LogActivityOptions } from "@/lib/store";
import type { Character } from "@/lib/types";

const STAT_COLORS: Record<StatKey, string> = {
  strength: "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20",
  stamina: "border-uri-teal/40 bg-uri-teal/10 hover:bg-uri-teal/20",
  knowledge: "border-uri-keaney/40 bg-uri-keaney/10 hover:bg-uri-keaney/20",
  social: "border-uri-green/40 bg-uri-green/10 hover:bg-uri-green/20",
  focus: "border-uri-purple/40 bg-uri-purple/10 hover:bg-uri-purple/20",
};

export function ActivityList({
  onLog,
  disabled,
}: {
  onLog: (activityId: string, options?: LogActivityOptions) => Character | null;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [minutes, setMinutes] = useState("");
  const [proof, setProof] = useState("");
  const [tags, setTags] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activity = selected ? getActivityById(selected) : null;
  const needsMinutes = activity?.usesMinutes ?? false;

  const proofValid = proof.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (!proofValid) return;
    if (needsMinutes) {
      const m = parseInt(minutes, 10);
      if (Number.isNaN(m) || m < 0) return;
    }
    const options: LogActivityOptions = {};
    if (needsMinutes) options.minutes = Math.max(0, parseInt(minutes, 10) || 0);
    options.proofUrl = proof.trim();
    if (tags.trim()) options.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    setSubmitError(null);
    const updated = onLog(selected, options);
    if (updated) {
      setSelected(null);
      setMinutes("");
      setProof("");
      setTags("");
    } else {
      setSubmitError("Proof required. Add a photo, screenshot, or notes.");
    }
  }

  return (
    <section className="rounded-2xl bg-white/[0.08] border border-white/20 p-4 shadow-xl shadow-black/20">
      <h2 className="font-display font-semibold text-white mb-1">
        Log real actions → earn XP
      </h2>
      <p className="text-sm text-white/50 mb-4">
        Upload proof (photo URL, screenshot link, or notes) to level up your stats.
      </p>
      <div className="grid gap-2">
        {ACTIVITIES.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => setSelected(act.id)}
            disabled={disabled}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${STAT_COLORS[act.stat]}`}
          >
            <span className="text-2xl">{act.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white">{act.label}</div>
              <div className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                <span>{STAT_ICONS[act.stat]} +{act.statGain}</span>
                <span className="text-white/40">·</span>
                <span className="text-uri-keaney font-mono">+{act.xp} XP</span>
              </div>
            </div>
            <span className="text-xs text-uri-keaney/90 font-mono">Log it</span>
          </button>
        ))}
      </div>

      {selected && activity && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 rounded-xl border border-uri-keaney/30 bg-white/5 space-y-3"
        >
          <h3 className="font-medium text-white flex items-center gap-2">
            <span>{activity.icon}</span> {activity.label}
          </h3>
          {needsMinutes && (
            <div>
              <label className="block text-xs text-white/60 mb-1">Minutes</label>
              <input
                type="number"
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 font-mono focus:ring-2 focus:ring-uri-keaney/50"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-white/60 mb-1">Proof (required) — photo URL or notes</label>
            <input
              type="text"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Paste image URL, screenshot link, or short note"
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-uri-keaney/50"
            />
            {!proofValid && proof.length > 0 && (
              <p className="text-xs text-amber-400 mt-1">Proof cannot be empty.</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Tags (optional, comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. ch3, practice"
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40"
            />
          </div>
          {submitError && (
            <p className="text-sm text-amber-400">{submitError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSelected(null); setSubmitError(null); }}
              className="px-3 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-uri-keaney text-uri-navy font-semibold hover:bg-uri-keaney/90 disabled:opacity-50 shadow-md"
              disabled={!proofValid || (needsMinutes && (Number.isNaN(parseInt(minutes, 10)) || parseInt(minutes, 10) < 0))}
            >
              Log & earn XP
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
