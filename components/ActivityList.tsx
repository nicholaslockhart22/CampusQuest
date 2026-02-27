"use client";

import { useMemo, useState, useRef } from "react";
import { ACTIVITIES, getActivityById } from "@/lib/activities";
import type { StatKey } from "@/lib/types";
import { STAT_ICONS, STAT_LABELS } from "@/lib/types";
import type { LogActivityOptions } from "@/lib/store";
import { MAX_ACTIVITY_MINUTES } from "@/lib/store";
import type { Character } from "@/lib/types";
import type { ActivityDefinition } from "@/lib/types";

const STAT_COLORS: Record<StatKey, string> = {
  strength: "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20",
  stamina: "border-uri-teal/40 bg-uri-teal/10 hover:bg-uri-teal/20",
  knowledge: "border-uri-keaney/40 bg-uri-keaney/10 hover:bg-uri-keaney/20",
  social: "border-uri-green/40 bg-uri-green/10 hover:bg-uri-green/20",
  focus: "border-uri-purple/40 bg-uri-purple/10 hover:bg-uri-purple/20",
};

const STAT_HEADER_BG: Record<StatKey, string> = {
  strength: "bg-amber-400/15 border-amber-400/30",
  stamina: "bg-uri-teal/15 border-uri-teal/30",
  knowledge: "bg-uri-keaney/15 border-uri-keaney/30",
  social: "bg-uri-green/15 border-uri-green/30",
  focus: "bg-uri-purple/15 border-uri-purple/30",
};

/** Group activities by stat (already ordered by stat then statGain) */
function groupActivitiesByStat(activities: ActivityDefinition[]): { stat: StatKey; items: ActivityDefinition[] }[] {
  const groups = new Map<StatKey, ActivityDefinition[]>();
  for (const act of activities) {
    const list = groups.get(act.stat) ?? [];
    list.push(act);
    groups.set(act.stat, list);
  }
  const order: StatKey[] = ["strength", "stamina", "knowledge", "social", "focus"];
  return order.map((stat) => ({ stat, items: groups.get(stat) ?? [] })).filter((g) => g.items.length > 0);
}

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
  const proofFileRef = useRef<HTMLInputElement>(null);
  const [expandedStats, setExpandedStats] = useState<Set<StatKey>>(new Set());

  const byStat = useMemo(() => groupActivitiesByStat(ACTIVITIES), []);

  function toggleStat(stat: StatKey) {
    setExpandedStats((prev) => {
      const next = new Set(prev);
      if (next.has(stat)) next.delete(stat);
      else next.add(stat);
      return next;
    });
  }

  const proofValid = proof.trim().length > 0;

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose an image file (e.g. JPEG, PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProof(dataUrl);
      setSubmitError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent, activityId: string, needsMinutes: boolean) {
    e.preventDefault();
    if (!proofValid) return;
    if (needsMinutes) {
      const m = parseInt(minutes, 10);
      if (Number.isNaN(m) || m < 0) return;
    }
    const options: LogActivityOptions = {};
    if (needsMinutes) {
      const raw = parseInt(minutes, 10) || 0;
      options.minutes = Math.min(MAX_ACTIVITY_MINUTES, Math.max(0, raw));
    }
    options.proofUrl = proof.trim();
    if (tags.trim()) options.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    setSubmitError(null);
    const updated = onLog(activityId, options);
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
    <section className="card p-4 sm:p-5">
      <h2 className="font-display font-semibold text-white mb-1">
        Log activity · Earn XP
      </h2>
      <p className="text-sm text-white/50 mb-4">
        Add proof (photo URL, link, or note) to level up your stats.
      </p>
      <div className="grid gap-4">
        {byStat.map(({ stat, items }) => {
          const isExpanded = expandedStats.has(stat);
          return (
          <div key={stat} className="space-y-2">
            <button
              type="button"
              onClick={() => toggleStat(stat)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-colors hover:opacity-90 ${STAT_HEADER_BG[stat]}`}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <span className="text-base">{STAT_ICONS[stat]}</span>
                <span>{STAT_LABELS[stat]}</span>
              </div>
              <span className="flex items-center gap-2">
                <span className="text-[11px] text-white/50 font-mono">{items.length} activities</span>
                <span className="text-white/70 text-sm" aria-hidden>{isExpanded ? "▼" : "▶"}</span>
              </span>
            </button>
            {isExpanded && (
            <div className="grid gap-2">
              {items.map((act) => {
                const isSelected = selected === act.id;
                const needsMinutes = act.usesMinutes ?? false;
                return (
                  <div key={act.id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(act.id);
                        setSubmitError(null);
                        setMinutes("");
                        setProof("");
                        setTags("");
                      }}
                      disabled={disabled}
                      className={`group flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${STAT_COLORS[act.stat]} ${
                        isSelected
                          ? "ring-2 ring-uri-gold ring-offset-2 ring-offset-uri-navy shadow-lg shadow-uri-gold/20"
                          : "hover:-translate-y-[1px]"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span className="text-2xl w-8 text-center">{act.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-white truncate">{act.label}</div>
                          {isSelected && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-uri-gold/25 text-uri-gold border border-uri-gold/50 flex-shrink-0">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/50 mt-0.5 truncate">{act.description}</div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80 font-mono">
                            {STAT_ICONS[act.stat]} +{act.statGain}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-uri-keaney/15 border border-uri-keaney/25 text-uri-keaney font-mono">
                            +{act.xp} XP
                          </span>
                          {needsMinutes && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/70">
                              ⏱ minutes
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 group-hover:bg-white/15 group-hover:text-white transition-colors flex-shrink-0">
                        Log it →
                      </span>
                    </button>

                    {/* Inline proof form (smooth pop under selected activity) */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        isSelected
                          ? "max-h-[520px] opacity-100 translate-y-0"
                          : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
                      }`}
                    >
                      {isSelected && (
                        <form
                          onSubmit={(e) => handleSubmit(e, act.id, needsMinutes)}
                          className="p-4 rounded-2xl border border-uri-keaney/25 bg-uri-keaney/5 space-y-3"
                        >
                          <h3 className="font-medium text-white flex items-center gap-2">
                            <span>{act.icon}</span> {act.label}
                          </h3>
                          {needsMinutes && (
                            <div>
                              <label className="block text-xs text-white/60 mb-1">
                                Minutes (max {MAX_ACTIVITY_MINUTES})
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={MAX_ACTIVITY_MINUTES}
                                value={minutes}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (v === "") setMinutes("");
                                  else {
                                    const n = parseInt(v, 10);
                                    if (!Number.isNaN(n)) setMinutes(String(Math.min(MAX_ACTIVITY_MINUTES, Math.max(0, n))));
                                  }
                                }}
                                placeholder="e.g. 50"
                                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 font-mono focus:ring-2 focus:ring-uri-keaney/50"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-xs text-white/60 mb-1">Proof (required) — photo or notes</label>
                            <input
                              type="text"
                              value={proof.startsWith("data:") ? "" : proof}
                              onChange={(e) => setProof(e.target.value)}
                              placeholder="Paste image URL, link, or short note"
                              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-uri-keaney/50"
                            />
                            <input
                              ref={proofFileRef}
                              type="file"
                              accept="image/*"
                              onChange={handleProofFileChange}
                              className="hidden"
                              aria-label="Add photo from device"
                            />
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => proofFileRef.current?.click()}
                                className="text-xs font-medium text-uri-keaney hover:text-uri-keaney/80 px-3 py-2 rounded-lg border border-uri-keaney/40 hover:bg-uri-keaney/10 transition-colors"
                              >
                                📷 Add photo from device
                              </button>
                              {proof.startsWith("data:") && (
                                <span className="text-xs text-uri-keaney/90">Image attached</span>
                              )}
                            </div>
                            {proof.startsWith("data:") && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-white/15 max-w-[200px]">
                                <img src={proof} alt="Proof" className="w-full h-24 object-cover" />
                              </div>
                            )}
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
                              onClick={() => {
                                setSelected(null);
                                setSubmitError(null);
                                setMinutes("");
                                setProof("");
                                setTags("");
                              }}
                              className="px-3 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-2 rounded-xl bg-uri-keaney text-white font-semibold hover:bg-uri-keaney/90 disabled:opacity-50 shadow-md"
                              disabled={
                                !proofValid ||
                                (needsMinutes && (Number.isNaN(parseInt(minutes, 10)) || parseInt(minutes, 10) < 0 || parseInt(minutes, 10) > MAX_ACTIVITY_MINUTES))
                              }
                            >
                              Log & earn XP
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
          );
        })}
      </div>
    </section>
  );
}
