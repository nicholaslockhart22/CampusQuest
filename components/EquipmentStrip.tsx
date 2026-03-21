"use client";

import type { Character } from "@/lib/types";
import { COSMETICS } from "@/lib/cosmetics";
import { aggregateBuffs, describeCosmeticEquipEffect } from "@/lib/gameBuffs";
import { setEquippedCosmeticSlot } from "@/lib/store";

const SLOTS = ["hat", "glasses", "backpack"] as const;

export function EquipmentStrip({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const unlocked = new Set(character.unlockedCosmetics ?? []);
  const eq = character.equippedCosmetics ?? {};
  const buffs = aggregateBuffs(character);

  return (
    <div className="card p-4 border border-uri-gold/25">
      <h4 className="text-sm font-display font-bold text-uri-gold mb-1 flex items-center gap-2">
        <span aria-hidden>🎁</span> Equipment loadout
      </h4>
      <p className="text-[11px] text-white/50 mb-3">Equip unlocked loot for real XP & streak-save bonuses.</p>
      {buffs.lines.length > 0 && (
        <ul className="text-xs text-emerald-200/90 space-y-0.5 mb-3">
          {buffs.lines.map((line) => (
            <li key={line}>✓ {line}</li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SLOTS.map((slot) => {
          const options = COSMETICS.filter((c) => c.slot === slot && unlocked.has(c.id));
          return (
            <label key={slot} className="block text-[10px] uppercase tracking-wider text-white/50">
              {slot}
              <select
                value={eq[slot] ?? ""}
                onChange={(e) => {
                  setEquippedCosmeticSlot(character.id, slot, e.target.value || null);
                  onRefresh?.();
                }}
                className="mt-1 w-full px-2 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm"
              >
                <option value="">None</option>
                {options.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label} — {describeCosmeticEquipEffect(c.id)}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </div>
  );
}
