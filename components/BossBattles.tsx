"use client";

import { useState, useCallback, useMemo } from "react";
import {
  getUserBosses,
  getActiveBossId,
  getActiveBoss,
  setActiveBossId,
  addUserBoss,
  deleteUserBoss,
  MAX_BOSSES,
  MIN_BOSS_HP,
} from "@/lib/store";
import type { UserBoss, Character, StatKey } from "@/lib/types";
import { STAT_ICONS, STAT_LABELS } from "@/lib/types";
import { getCosmeticById } from "@/lib/cosmetics";

const DELETE_CONFIRM_DIALOGS: { message: string; fightOn: string; retreat: string }[] = [
  {
    message: "Halt, brave scholar! Wouldst thou truly abandon this mighty foe? Thy XP and honor hang in the balance!",
    fightOn: "Nay, I shall fight on!",
    retreat: "Aye… retreat to the tavern.",
  },
  {
    message: "By the King's decree, thou seekest to flee this boss battle. Art thou certain thou wilt trade glory for shame and unfinished homework?",
    fightOn: "For glory and GPA!",
    retreat: "Let the enemy win…",
  },
  {
    message: "Good sir/ma'am, thou wouldst forsake this quest? Think of thy streaks, thy leaderboard rank, and the shame before the CampusQuest Guild of URI!",
    fightOn: "I fight for the Guild!",
    retreat: "I yield… midterms broke me.",
  },
  {
    message: "The ancient scrolls warn against cowardice. Abandoning this boss may curse thee with procrastination for seven fortnights.",
    fightOn: "Lift thy sword!",
    retreat: "Accept the curse…",
  },
  {
    message: "Thou art about to rage-quit like a peasant unplugging the royal router. Dost thou swear this is thy final decision?",
    fightOn: "I repent! Back to battle!",
    retreat: "Unplug the router.",
  },
  {
    message: "Art thou certain thou wouldst flee this boss, brave student knight?",
    fightOn: "Fight On",
    retreat: "Retreat to the Quad.",
  },
];

function getRandomDeleteDialog() {
  return DELETE_CONFIRM_DIALOGS[Math.floor(Math.random() * DELETE_CONFIRM_DIALOGS.length)];
}

const FINAL_BOSS_HP = 500; // Any boss with maxHp > 500 is a Final Boss

export function BossBattles({ character, onRefresh }: { character: Character; onRefresh?: () => void }) {
  const [bossName, setBossName] = useState("");
  const [bossHp, setBossHp] = useState("250");
  const [bossToDelete, setBossToDelete] = useState<UserBoss | null>(null);
  const deleteDialog = useMemo(() => (bossToDelete ? getRandomDeleteDialog() : null), [bossToDelete]);

  const bosses = getUserBosses();
  const finalBosses = bosses.filter((b) => b.maxHp > FINAL_BOSS_HP);
  const regularBosses = bosses.filter((b) => b.maxHp <= FINAL_BOSS_HP);
  const activeId = getActiveBossId();
  const activeBoss = getActiveBoss();

  const handleAddBoss = useCallback(() => {
    if (bosses.length >= MAX_BOSSES) return;
    const name = bossName.trim() || "Boss";
    const hp = Math.max(MIN_BOSS_HP, parseInt(bossHp, 10) || MIN_BOSS_HP);
    const added = addUserBoss(name, hp, true);
    if (added) {
      setBossName("");
      setBossHp(String(MIN_BOSS_HP));
      onRefresh?.();
    }
  }, [bossName, bossHp, onRefresh, bosses.length]);

  const handleSwitchTarget = useCallback(
    (boss: UserBoss) => {
      if (boss.defeated) return;
      const newId = activeId === boss.id ? null : boss.id;
      setActiveBossId(newId);
      onRefresh?.();
    },
    [activeId, onRefresh]
  );

  const handleConfirmDelete = useCallback(() => {
    if (bossToDelete) {
      deleteUserBoss(bossToDelete.id);
      setBossToDelete(null);
      onRefresh?.();
    }
  }, [bossToDelete, onRefresh]);

  return (
    <section className="card overflow-hidden p-0">
      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 bg-gradient-to-b from-uri-keaney/10 to-transparent border-b border-uri-keaney/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-uri-navy/80 border border-uri-keaney/30 flex items-center justify-center text-xl shadow-inner">
            ⚔️
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">Boss Battles</h3>
            <p className="text-xs text-white/60">
              Add up to {MAX_BOSSES} bosses (min 250 HP). Any logged activity deals damage to the one you attack. Boss weakness boosts damage for matching stats. XP on defeat: 100 + 5 per 10 HP above 250.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Add new boss (only if under limit) */}
        {bosses.length < MAX_BOSSES && (
          <div className="boss-card-default rounded-2xl p-4 space-y-3">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-uri-keaney">+</span> Add new boss ({bosses.length}/{MAX_BOSSES})
            </div>
            <input
              type="text"
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              placeholder="e.g. MTH215 Midterm"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-uri-keaney/50 focus:border-uri-keaney/40 transition-colors"
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={MIN_BOSS_HP}
                value={bossHp}
                onChange={(e) => setBossHp(e.target.value)}
                placeholder={`HP (min ${MIN_BOSS_HP})`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-uri-keaney/50 focus:border-uri-keaney/40 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddBoss}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-b from-uri-keaney to-uri-keaney/80 text-white font-semibold hover:from-uri-keaney/95 hover:to-uri-keaney/70 border border-uri-keaney/50 shadow-lg shadow-uri-keaney/20 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                ⚔️ Add
              </button>
            </div>
          </div>
        )}
        {bosses.length >= MAX_BOSSES && (
          <div className="rounded-xl px-3 py-2 bg-white/10 border border-white/20 text-center text-sm text-white/70">
            Maximum {MAX_BOSSES} bosses. Defeat or remove one to free a slot.
          </div>
        )}

        {/* Delete confirmation modal — random medieval message */}
        {bossToDelete && deleteDialog && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70"
              aria-hidden
              onClick={() => setBossToDelete(null)}
            />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(22rem,92vw)] p-5 rounded-2xl bg-uri-navy border-2 border-uri-gold/50 shadow-2xl shadow-black/40">
              <p className="text-uri-gold font-semibold text-sm uppercase tracking-wider mb-2">
                ⚔️ Abandon boss?
              </p>
              <p className="text-white/95 text-sm leading-relaxed mb-5">
                {deleteDialog.message}
              </p>
              <p className="text-white/50 text-xs mb-4">
                Removing &quot;{bossToDelete.name}&quot; frees a slot. No XP earned.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setBossToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-uri-keaney text-white font-semibold border border-uri-keaney/50 hover:bg-uri-keaney/90 transition-colors"
                >
                  👉 {deleteDialog.fightOn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-white/90 font-semibold border border-white/30 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-200 transition-colors"
                >
                  👉 {deleteDialog.retreat}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Which boss is currently being attacked */}
        {activeBoss && !activeBoss.defeated && (
          <div className="rounded-xl px-3 py-2 bg-uri-keaney/15 border border-uri-keaney/30 text-center">
            <span className="text-xs text-white/70">Currently attacking: </span>
            <span className="text-sm font-semibold text-uri-keaney">{activeBoss.name}</span>
          </div>
        )}

        {/* Final Boss box — 500+ HP, special styling */}
        <div className="final-boss-box rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>👑</span>
            <h4 className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-uri-gold via-amber-200 to-uri-gold text-sm uppercase tracking-widest">
              Final Boss
            </h4>
            <span className="text-white/50 text-xs">({FINAL_BOSS_HP}+ HP)</span>
          </div>
          {finalBosses.length === 0 ? (
            <div className="rounded-xl py-6 px-4 text-center bg-black/20 border border-uri-gold/20">
              <p className="text-white/60 text-sm">No Final Boss yet.</p>
              <p className="text-uri-gold/90 text-xs mt-1">Create a boss with 500+ HP to unlock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {finalBosses.map((boss) => {
                const isActive = activeId === boss.id;
                const hpPct = boss.defeated ? 0 : Math.min(100, (boss.currentHp / boss.maxHp) * 100);
                const weakness = boss.weaknessStat as StatKey | undefined;
                const loot = (boss.loot ?? []).map((id) => getCosmeticById(id)).filter(Boolean);
                return (
                  <div
                    key={boss.id}
                    className={`final-boss-card rounded-xl p-4 flex items-center gap-4 ${boss.defeated ? "opacity-80" : ""}`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-black/40 border border-uri-gold/40 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                      {boss.defeated ? "💀" : "👑"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-white flex items-center gap-2 flex-wrap">
                        {boss.name}
                        {boss.defeated && (
                          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/50">
                            ✓ Defeated
                          </span>
                        )}
                        {!boss.defeated && isActive && (
                          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-uri-gold/30 text-uri-gold border border-uri-gold/50">
                            Attacking
                          </span>
                        )}
                        {weakness && (
                          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                            Weak: {STAT_ICONS[weakness]} {STAT_LABELS[weakness]}
                          </span>
                        )}
                        {loot.length > 0 && (
                          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-uri-keaney/15 text-uri-keaney border border-uri-keaney/30">
                            Loot: {loot.slice(0, 2).map((l) => l!.icon).join(" ")}{loot.length > 2 ? ` +${loot.length - 2}` : ""}
                          </span>
                        )}
                      </div>
                      {!boss.defeated && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-white/70 mb-1">
                            <span>HP</span>
                            <span className="font-mono font-semibold text-amber-200">{boss.currentHp} / {boss.maxHp}</span>
                          </div>
                          <div className="final-boss-hp-bar">
                            <div className="final-boss-hp-fill" style={{ width: `${hpPct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-uri-gold/25 border border-uri-gold/50 text-right">
                        <span className="text-uri-gold font-mono font-bold text-sm">+{boss.xpReward}</span>
                        <span className="text-uri-gold/90 text-[10px] ml-0.5">XP</span>
                      </div>
                      {!boss.defeated && (
                        <button
                          type="button"
                          onClick={() => handleSwitchTarget(boss)}
                          className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? "bg-uri-gold/30 text-uri-gold border border-uri-gold/50 hover:bg-uri-gold/40"
                              : "bg-white/10 text-white border border-uri-gold/30 hover:bg-uri-gold/20 hover:border-uri-gold/50 hover:text-uri-gold"
                          }`}
                        >
                          {isActive ? "Stop" : "Attack"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setBossToDelete(boss)}
                        className="p-2 rounded-lg text-white/40 hover:text-red-300 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-colors"
                        aria-label={`Remove ${boss.name}`}
                        title="Remove boss (frees a slot, no XP)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* List of user bosses — switch which one to attack */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-0.5">
            Your bosses
          </h4>
          {bosses.length === 0 ? (
            <div className="boss-card-default rounded-2xl p-6 text-center">
              <p className="text-white/50 text-sm">No bosses yet. Add one above and start attacking by logging activities.</p>
            </div>
          ) : regularBosses.length === 0 ? (
            <div className="boss-card-default rounded-2xl p-4 text-center">
              <p className="text-white/50 text-sm">All your bosses are Final Bosses — see above. 👑</p>
            </div>
          ) : (
            regularBosses.map((boss) => {
              const isActive = activeId === boss.id;
              const hpPct = boss.defeated ? 0 : Math.min(100, (boss.currentHp / boss.maxHp) * 100);
              const weakness = boss.weaknessStat as StatKey | undefined;
              const loot = (boss.loot ?? []).map((id) => getCosmeticById(id)).filter(Boolean);
              return (
                <div
                  key={boss.id}
                  className={`rounded-2xl p-4 flex items-center gap-4 ${
                    boss.defeated ? "boss-card-defeated" : isActive ? "boss-card-active" : "boss-card-default"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {boss.defeated ? "💀" : "🧟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-white flex items-center gap-2 flex-wrap">
                      {boss.name}
                      {boss.defeated && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                          ✓ Defeated
                        </span>
                      )}
                      {!boss.defeated && isActive && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-uri-keaney/25 text-uri-keaney border border-uri-keaney/40">
                          Attacking
                        </span>
                      )}
                      {weakness && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                          Weak: {STAT_ICONS[weakness]} {STAT_LABELS[weakness]}
                        </span>
                      )}
                      {loot.length > 0 && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-uri-keaney/15 text-uri-keaney border border-uri-keaney/30">
                          Loot: {loot.slice(0, 2).map((l) => l!.icon).join(" ")}{loot.length > 2 ? ` +${loot.length - 2}` : ""}
                        </span>
                      )}
                    </div>
                    {!boss.defeated && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                          <span>HP</span>
                          <span className="font-mono text-red-200/90">{boss.currentHp} / {boss.maxHp}</span>
                        </div>
                        <div className="boss-hp-bar h-2">
                          <div className="boss-hp-fill" style={{ width: `${hpPct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="px-2.5 py-1 rounded-lg bg-uri-gold/20 border border-uri-gold/40 text-right">
                      <span className="text-uri-gold font-mono font-bold text-sm">+{boss.xpReward}</span>
                      <span className="text-uri-gold/90 text-[10px] ml-0.5">XP</span>
                    </div>
                    {!boss.defeated && (
                      <button
                        type="button"
                        onClick={() => handleSwitchTarget(boss)}
                        className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-uri-keaney/30 text-uri-keaney border border-uri-keaney/50 hover:bg-uri-keaney/40"
                            : "bg-white/10 text-white border border-white/20 hover:bg-uri-keaney/20 hover:border-uri-keaney/40 hover:text-uri-keaney"
                        }`}
                      >
                        {isActive ? "Stop" : "Attack"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setBossToDelete(boss)}
                      className="p-2 rounded-lg text-white/40 hover:text-red-300 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-colors"
                      aria-label={`Remove ${boss.name}`}
                      title="Remove boss (frees a slot, no XP)"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
