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
import { CHARACTER_CLASSES, CLASS_AVATAR_PRESETS, STARTER_WEAPONS, type CharacterClassId } from "@/lib/characterClasses";
import { isCosmeticUnlocked } from "@/lib/cosmetics";
import { AvatarDisplay } from "./AvatarDisplay";

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
  unlockContext?: { achievements: string[]; level: number; unlockedCosmetics?: string[] | null } | null;
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

  const previewSize = compact ? 72 : 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div
          className="rounded-2xl bg-white/10 border border-uri-keaney/30 flex items-center justify-center overflow-hidden"
          style={{ width: previewSize + 16, height: previewSize + 16 }}
        >
          <AvatarDisplay avatar={serializeAvatar(data)} size={previewSize} />
        </div>
        {!compact && (
          <p className="text-xs text-white/50 text-center sm:text-left">Preview updates as you choose.</p>
        )}
      </div>

      {showClassPresets && !compact && (
        <>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              🐏 Class (outfit style)
            </label>
            <div className="flex flex-wrap gap-2">
              {CHARACTER_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => applyClassPreset(cls.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedClassId === cls.id
                      ? "bg-uri-keaney text-white ring-2 ring-uri-gold/50"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                  title={`${cls.name} — ${cls.styleSub}`}
                >
                  <span aria-hidden>{cls.icon}</span>
                  <span>{cls.outfitLabel}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-1">Picks a look that matches your CampusQuest class.</p>
          </div>
          {onWeaponChange && (
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Starter weapon
              </label>
              <div className="flex flex-wrap gap-2">
                {STARTER_WEAPONS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onWeaponChange(selectedWeapon === w.id ? null : w.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      selectedWeapon === w.id
                        ? "bg-uri-gold/30 text-uri-gold border border-uri-gold/50"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    <span aria-hidden>{w.icon}</span>
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        {/* Skin tone */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Skin tone
          </label>
          <div className="flex flex-wrap gap-2">
            {SKIN_TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ skin: t.id })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  data.skin === t.id ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40" : "border-white/30 hover:border-white/50"
                }`}
                style={{ backgroundColor: t.color }}
                title={t.label}
                aria-pressed={data.skin === t.id}
              />
            ))}
          </div>
        </div>

        {/* Face style */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Face
          </label>
          <div className="flex flex-wrap gap-2">
            {FACE_STYLES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => update({ face: f.id })}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
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

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Gender
          </label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => update({ gender: g.id })}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  data.gender === g.id
                    ? "bg-uri-keaney text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body type */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Body type
          </label>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => update({ body: b.id })}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  data.body === b.id
                    ? "bg-uri-keaney text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hair style */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Hair style
          </label>
          <div className="flex flex-wrap gap-2">
            {HAIR_STYLES.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => update({ hair: h.id })}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
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

        {/* Hair color */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Hair color
          </label>
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => update({ hairColor: c.id })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  data.hairColor === c.id ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40" : "border-white/30 hover:border-white/50"
                }`}
                style={{ backgroundColor: c.color }}
                title={c.label}
                aria-pressed={data.hairColor === c.id}
              />
            ))}
          </div>
        </div>

        {/* Glasses */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Glasses
          </label>
          <div className="flex flex-wrap gap-2">
            {GLASSES_STYLES.map((g) => (
              (() => {
                const locked = !isUnlocked("glasses", g.id);
                const selected = (data.glasses ?? "none") === g.id;
                return (
              <button
                key={g.id}
                type="button"
                onClick={() => update({ glasses: g.id })}
                disabled={locked}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selected
                    ? "bg-uri-keaney text-white"
                    : locked
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
                title={locked ? "Locked — earn achievements to unlock" : g.label}
              >
                {g.label}{locked ? " 🔒" : ""}
              </button>
                );
              })()
            ))}
          </div>
        </div>

        {/* Hat */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Hat
          </label>
          <div className="flex flex-wrap gap-2">
            {HAT_STYLES.map((h) => (
              (() => {
                const locked = !isUnlocked("hat", h.id);
                const selected = (data.hat ?? "none") === h.id;
                return (
              <button
                key={h.id}
                type="button"
                onClick={() => update({ hat: h.id })}
                disabled={locked}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selected
                    ? "bg-uri-keaney text-white"
                    : locked
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
                title={locked ? "Locked — earn achievements to unlock" : h.label}
              >
                {h.label}{locked ? " 🔒" : ""}
              </button>
                );
              })()
            ))}
          </div>
        </div>

        {/* Backpack */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Backpack
          </label>
          <div className="flex flex-wrap gap-2">
            {BACKPACK_STYLES.map((b) => (
              (() => {
                const locked = !isUnlocked("backpack", b.id);
                const selected = (data.backpack ?? "none") === b.id;
                return (
              <button
                key={b.id}
                type="button"
                onClick={() => update({ backpack: b.id })}
                disabled={locked}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selected
                    ? "bg-uri-keaney text-white"
                    : locked
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
                title={locked ? "Locked — earn achievements to unlock" : b.label}
              >
                {b.label}{locked ? " 🔒" : ""}
              </button>
                );
              })()
            ))}
          </div>
        </div>

        {/* Clothes style */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Clothes
          </label>
          <div className="flex flex-wrap gap-2">
            {CLOTHES_STYLES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => update({ clothes: c.id })}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  data.clothes === c.id
                    ? "bg-uri-keaney text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clothes color */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Clothes color
          </label>
          <div className="flex flex-wrap gap-2">
            {CLOTHES_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => update({ clothesColor: c.id })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  data.clothesColor === c.id ? "border-uri-keaney scale-110 ring-2 ring-uri-keaney/40" : "border-white/30 hover:border-white/50"
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
  );
}
