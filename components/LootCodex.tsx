"use client";

import { useMemo, useState } from "react";
import { COSMETICS, type CosmeticItem, type LootRarity } from "@/lib/cosmetics";
import { getLootLogForCharacter, type LootDropEntry } from "@/lib/lootLog";

const RARITY_LABELS: Record<LootRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

const RARITY_TAG_CLASS: Record<LootRarity, string> = {
  common: "bg-white/10 text-white/90 border-white/25",
  uncommon: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  rare: "bg-uri-keaney/20 text-uri-keaney border-uri-keaney/60",
  legendary: "bg-uri-gold/20 text-amber-100 border-uri-gold/70 loot-legendary-tag",
};

const getCardClass = (discovered: boolean, rarity: LootRarity): string => {
  if (!discovered) {
    switch (rarity) {
      case "common":
        return "bg-white/5 border-white/10";
      case "uncommon":
        return "bg-emerald-500/5 border-emerald-400/20";
      case "rare":
        return "bg-uri-keaney/5 border-uri-keaney/25";
      case "legendary":
        return "bg-uri-gold/5 border-uri-gold/35";
    }
  }

  switch (rarity) {
    case "common":
      return "bg-white/10 border-white/20";
    case "uncommon":
      return "bg-emerald-500/10 border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.14)]";
    case "rare":
      return "bg-uri-keaney/10 border-uri-keaney/55 shadow-[0_0_22px_rgba(104,171,232,0.22)]";
    case "legendary":
      return "bg-gradient-to-br from-uri-gold/28 via-amber-300/12 to-uri-keaney/10 border-uri-gold/90 shadow-[0_0_46px_rgba(197,165,40,0.45)] loot-legendary-card relative overflow-hidden";
  }
};

const getIconFrameClass = (discovered: boolean, rarity: LootRarity): string => {
  if (!discovered) {
    // Keep undiscovered items muted but still lightly tinted by rarity.
    switch (rarity) {
      case "common":
        return "bg-white/5 border-white/10";
      case "uncommon":
        return "bg-emerald-500/5 border-emerald-400/20";
      case "rare":
        return "bg-uri-keaney/5 border-uri-keaney/25";
      case "legendary":
        return "bg-uri-gold/5 border-uri-gold/35";
    }
  }

  switch (rarity) {
    case "common":
      return "bg-white/10 border-white/15";
    case "uncommon":
      return "bg-emerald-500/10 border-emerald-400/35";
    case "rare":
      return "bg-uri-keaney/10 border-uri-keaney/45";
    case "legendary":
      return "bg-gradient-to-br from-uri-gold/30 to-amber-400/12 border-uri-gold/80 loot-legendary-icon relative overflow-hidden";
  }
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function LootCodex({ characterId, onClose }: { characterId: string; onClose: () => void }) {
  const [filterRarity, setFilterRarity] = useState<LootRarity | "">("");
  const [filterBoss, setFilterBoss] = useState<string>("");

  const { lootLog, discoveredIds, firstDropByCosmetic, uniqueBosses } = useMemo(() => {
    const log = getLootLogForCharacter(characterId);
    const discovered = new Set(log.map((e) => e.cosmeticId));
    const firstByCosmetic = new Map<string, LootDropEntry>();
    for (const entry of log) {
      if (!firstByCosmetic.has(entry.cosmeticId)) firstByCosmetic.set(entry.cosmeticId, entry);
    }
    const bosses = Array.from(new Set(log.map((e) => e.bossName))).sort();
    return {
      lootLog: log,
      discoveredIds: discovered,
      firstDropByCosmetic: firstByCosmetic,
      uniqueBosses: bosses,
    };
  }, [characterId]);

  const filteredCosmetics = useMemo(() => {
    return COSMETICS.filter((c) => {
      if (filterRarity && c.rarity !== filterRarity) return false;
      if (filterBoss) {
        const first = firstDropByCosmetic.get(c.id);
        if (!first || first.bossName !== filterBoss) return false;
      }
      return true;
    });
  }, [filterRarity, filterBoss, firstDropByCosmetic]);

  const discoveredCount = discoveredIds.size;
  const totalCount = COSMETICS.length;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-uri-navy" role="dialog" aria-modal="true" aria-label="Loot Codex">
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>📜</span>
          <h2 className="font-display font-bold text-xl text-white">Loot Codex</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10">
        <p className="text-uri-keaney/95 font-mono text-sm font-semibold">
          {discoveredCount} / {totalCount} Drops Collected
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity((e.target.value || "") as LootRarity | "")}
            className="rounded-lg px-3 py-1.5 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-uri-keaney/50"
          >
            <option value="">All rarities</option>
            {(Object.keys(RARITY_LABELS) as LootRarity[]).map((r) => (
              <option key={r} value={r}>{RARITY_LABELS[r]}</option>
            ))}
          </select>
          {uniqueBosses.length > 0 && (
            <select
              value={filterBoss}
              onChange={(e) => setFilterBoss(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-uri-keaney/50"
            >
              <option value="">All bosses</option>
              {uniqueBosses.map((boss) => (
                <option key={boss} value={boss}>{boss}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredCosmetics.map((item) => {
            const discovered = discoveredIds.has(item.id);
            const firstDrop = firstDropByCosmetic.get(item.id);
            return (
              <LootCard
                key={item.id}
                item={item}
                discovered={discovered}
                firstDrop={firstDrop ?? null}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LootCard({
  item,
  discovered,
  firstDrop,
}: {
  item: CosmeticItem;
  discovered: boolean;
  firstDrop: LootDropEntry | null;
}) {
  const cardClass = getCardClass(discovered, item.rarity);
  const iconFrameClass = getIconFrameClass(discovered, item.rarity);

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col items-center text-center min-h-[10rem] ${cardClass}`}
    >
      <div
        className={`w-16 h-16 flex items-center justify-center rounded-xl mb-2 text-4xl border ${
          iconFrameClass
        } ${discovered ? "" : "grayscale opacity-50"} `}
        title={discovered ? item.label : "Not yet discovered"}
      >
        {item.icon}
      </div>
      <p className={`font-medium text-sm truncate w-full ${discovered ? "text-white" : "text-white/50"}`}>
        {discovered ? item.label : "???"}
      </p>
      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium border ${RARITY_TAG_CLASS[item.rarity]}`}>
        {RARITY_LABELS[item.rarity]}
      </span>
      {firstDrop && (
        <>
          <p className="text-xs text-white/60 mt-1.5 truncate w-full" title={firstDrop.bossName}>
            From: {firstDrop.bossName}
          </p>
          <p className="text-xs text-white/50 mt-0.5">{formatDate(firstDrop.obtainedAt)}</p>
        </>
      )}
      {!discovered && (
        <p className="text-xs text-white/40 mt-1 italic">Not yet discovered</p>
      )}
    </div>
  );
}
