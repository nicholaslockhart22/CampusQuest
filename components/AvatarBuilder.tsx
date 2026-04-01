"use client";

import { useState } from "react";
import {
  getDefaultCustomAvatar,
  parseAvatar,
  serializeAvatar,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  CLOTHES_STYLES,
  CLOTHES_COLORS,
  BODY_TYPES,
  GENDERS,
  FACE_STYLES,
  HAT_STYLES,
  GLASSES_STYLES,
  BACKPACK_STYLES,
  type CustomAvatarData,
} from "@/lib/avatarOptions";
import {
  CHARACTER_CLASSES,
  CLASS_AVATAR_PRESETS,
  STARTER_WEAPONS,
  type CharacterClassId,
} from "@/lib/characterClasses";
import { isCosmeticUnlocked } from "@/lib/cosmetics";
import { AvatarDisplay } from "./AvatarDisplay";

type UnlockContext = {
  achievements: string[];
  level: number;
  unlockedCosmetics?: string[] | null;
} | null;

export function AvatarBuilder({
  value,
  onChange,
  compact = false,
  showClassPresets = true,
  selectedClassId,
  onClassChange,
  selectedWeapon,
  onWeaponChange,
  unlockContext,
}: {
  value: string;
  onChange: (avatar: string) => void;
  compact?: boolean;
  showClassPresets?: boolean;
  selectedClassId?: CharacterClassId | null;
  onClassChange?: (classId: CharacterClassId | null) => void;
  selectedWeapon?: string | null;
  onWeaponChange?: (weaponId: string | null) => void;
  unlockContext?: UnlockContext;
}) {
  const [data, setData] = useState<CustomAvatarData>(() => {
    const parsed = parseAvatar(value);
    const out = parsed ?? getDefaultCustomAvatar();
    if (out.face == null) (out as CustomAvatarData).face = "smile";
    return out;
  });

  const update = (next: Partial<CustomAvatarData>) => {
    const nextData = { ...data, ...next };
    setData(nextData);
    onChange(serializeAvatar(nextData));
  };

  function isUnlocked(slot: "hat" | "glasses" | "backpack", id: string): boolean {
    if (id === "none") return true;
    if (!unlockContext) return true;
    return isCosmeticUnlocked({
      cosmeticId: `${slot}:${id}`,
      achievements: unlockContext.achievements ?? [],
      level: unlockContext.level ?? 1,
      unlockedCosmetics: unlockContext.unlockedCosmetics,
    });
  }

  const applyClassPreset = (classId: CharacterClassId) => {
    const preset = CLASS_AVATAR_PRESETS[classId];
    setData({ ...preset });
    onChange(serializeAvatar(preset));
    onClassChange?.(classId);
  };

  const previewSize = compact ? 72 : 132;

  // Compact version used inside small modals (e.g. edit avatar on character card)
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 overflow-hidden"
            style={{ width: previewSize + 16, height: previewSize + 16 }}
          >
            <AvatarDisplay avatar={serializeAvatar(data)} size={previewSize} />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl bg-white/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Appearance
          </p>

          {/* Skin */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
              Skin tone
            </label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ skin: t.id })}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    data.skin === t.id
                      ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40"
                      : "border-white/30 hover:border-white/50"
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.label}
                  aria-pressed={data.skin === t.id}
                />
              ))}
            </div>
          </div>

          {/* Hair + face (summary) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Hair
              </label>
              <div className="flex flex-wrap gap-1.5">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => update({ hair: h.id })}
                    className={`rounded-xl px-2 py-1 text-[11px] font-medium transition-all ${
                      data.hair === h.id
                        ? "bg-uri-keaney text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Face
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FACE_STYLES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => update({ face: f.id })}
                    className={`rounded-xl px-2 py-1 text-[11px] font-medium transition-all ${
                      (data.face ?? "smile") === f.id
                        ? "bg-uri-keaney text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen CampusQuest-themed creator
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-uri-navy via-uri-navy/90 to-uri-keaney/40 px-6 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.6)] w-full max-w-md">
          <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] border border-white/10/5" />
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.12),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(80,178,255,0.28),transparent_55%)] opacity-80 mix-blend-screen" />

          <div className="relative flex flex-col items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Live Avatar Preview
            </p>
            <div className="relative flex items-center justify-center rounded-3xl bg-[radial-gradient(circle_at_50%_0,#ffffff1f,transparent_55%)] px-6 pt-4 pb-3">
              <AvatarDisplay
                avatar={serializeAvatar(data)}
                size={previewSize}
                className="drop-shadow-[0_12px_32px_rgba(0,0,0,0.75)]"
              />
            </div>
            <p className="text-[11px] text-white/70">
              Every change you make updates this CampusQuest hero instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Class presets strip */}
      {showClassPresets && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-uri-navy/80 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-uri-keaney/80">
                Step 1 · Pick a vibe
              </p>
              <h3 className="text-sm font-semibold text-white">
                Class presets
              </h3>
              <p className="text-xs text-white/65">
                Start from a curated look inspired by each CampusQuest class.
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHARACTER_CLASSES.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => applyClassPreset(cls.id)}
                className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-medium tracking-wide transition-all ${
                  selectedClassId === cls.id
                    ? "border-uri-gold/70 bg-uri-keaney/90 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.65)]"
                    : "border-white/10 bg-white/5 text-white/80 hover:border-uri-keaney/60 hover:bg-uri-keaney/20"
                }`}
                title={`${cls.name} — ${cls.styleSub}`}
              >
                <span aria-hidden className="text-base">
                  {cls.icon}
                </span>
                <span className="truncate">{cls.outfitLabel}</span>
              </button>
            ))}
          </div>
          {onWeaponChange && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Starter weapon
              </label>
              <div className="flex flex-wrap gap-2">
                {STARTER_WEAPONS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onWeaponChange(selectedWeapon === w.id ? null : w.id)}
                    className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
                      selectedWeapon === w.id
                        ? "border-uri-gold/70 bg-uri-gold/20 text-uri-gold shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-uri-gold/60 hover:bg-uri-gold/10"
                    }`}
                  >
                    <span aria-hidden className="text-sm">
                      {w.icon}
                    </span>
                    <span className="truncate">{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main controls – tall, stacked sections for readability */}
      <section className="space-y-5 rounded-3xl border border-white/10 bg-uri-navy/90 px-4 py-5 sm:px-6 sm:py-6">
        {/* Appearance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-uri-keaney/80">
                Step 2 · Appearance
              </p>
              <h3 className="text-sm font-semibold text-white">
                Face & body
              </h3>
            </div>
          </div>

          {/* Skin */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
              Skin tone
            </label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ skin: t.id })}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    data.skin === t.id
                      ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40"
                      : "border-white/30 hover:border-white/50"
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.label}
                  aria-pressed={data.skin === t.id}
                />
              ))}
            </div>
          </div>

          {/* Face */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
              Face
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
              {FACE_STYLES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => update({ face: f.id })}
                  className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all text-left ${
                    (data.face ?? "smile") === f.id
                      ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body & gender */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Body type
              </label>
              <div className="grid gap-2">
                {BODY_TYPES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => update({ body: b.id })}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all text-left ${
                      data.body === b.id
                        ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Gender expression
              </label>
              <div className="grid gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => update({ gender: g.id })}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all text-left ${
                      data.gender === g.id
                        ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hair */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-uri-keaney/80">
                Step 3 · Hair
              </p>
              <h3 className="text-sm font-semibold text-white">
                Style & color
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Hair style
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => update({ hair: h.id })}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all text-left ${
                      data.hair === h.id
                        ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Hair color
              </label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update({ hairColor: c.id })}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${
                      data.hairColor === c.id
                        ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40"
                        : "border-white/30 hover:border-white/50"
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                    aria-pressed={data.hairColor === c.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Outfit */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-uri-keaney/80">
                Step 4 · Outfit
              </p>
              <h3 className="text-sm font-semibold text-white">
                Clothes & colors
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Clothes
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CLOTHES_STYLES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update({ clothes: c.id })}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all text-left ${
                      data.clothes === c.id
                        ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Clothes color
              </label>
              <div className="flex flex-wrap gap-2">
                {CLOTHES_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update({ clothesColor: c.id })}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${
                      data.clothesColor === c.id
                        ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40"
                        : "border-white/30 hover:border-white/50"
                    }`}
                    style={{ backgroundColor: c.color }}
                    aria-pressed={data.clothesColor === c.id}
                    title={c.id === "keaney" ? "URI blue" : c.id === "gold" ? "URI gold" : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accessories */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-uri-keaney/80">
                Step 5 · Accessories
              </p>
              <h3 className="text-sm font-semibold text-white">
                Glasses, hats, backpacks
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Glasses */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Glasses
              </label>
              <div className="grid gap-2">
                {GLASSES_STYLES.map((g) => {
                  const locked = !isUnlocked("glasses", g.id);
                  const selected = (data.glasses ?? "none") === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => update({ glasses: g.id })}
                      disabled={locked}
                      className={`rounded-2xl px-3 py-1.5 text-[11px] font-medium transition-all text-left ${
                        selected
                          ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                          : locked
                            ? "cursor-not-allowed bg-white/5 text-white/30"
                            : "bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                      title={locked ? "Locked — earn achievements to unlock" : g.label}
                    >
                      {g.label}
                      {locked ? " 🔒" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hat */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Hat
              </label>
              <div className="grid gap-2">
                {HAT_STYLES.map((h) => {
                  const locked = !isUnlocked("hat", h.id);
                  const selected = (data.hat ?? "none") === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => update({ hat: h.id })}
                      disabled={locked}
                      className={`rounded-2xl px-3 py-1.5 text-[11px] font-medium transition-all text-left ${
                        selected
                          ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                          : locked
                            ? "cursor-not-allowed bg-white/5 text-white/30"
                            : "bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                      title={locked ? "Locked — earn achievements to unlock" : h.label}
                    >
                      {h.label}
                      {locked ? " 🔒" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backpack */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                Backpack
              </label>
              <div className="grid gap-2">
                {BACKPACK_STYLES.map((b) => {
                  const locked = !isUnlocked("backpack", b.id);
                  const selected = (data.backpack ?? "none") === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => update({ backpack: b.id })}
                      disabled={locked}
                      className={`rounded-2xl px-3 py-1.5 text-[11px] font-medium transition-all text-left ${
                        selected
                          ? "bg-uri-keaney text-white shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                          : locked
                            ? "cursor-not-allowed bg-white/5 text-white/30"
                            : "bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                      title={locked ? "Locked — earn achievements to unlock" : b.label}
                    >
                      {b.label}
                      {locked ? " 🔒" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

