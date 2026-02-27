"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCharacter, logActivity, logout as storeLogout } from "@/lib/store";
import type { Character } from "@/lib/types";
import { CharacterCard } from "./CharacterCard";
import { CharacterGate } from "./CharacterGate";
import { WelcomeSplash } from "./WelcomeSplash";
import { ActivityList } from "./ActivityList";
import { TheQuad } from "./TheQuad";
import { DailyQuests } from "./DailyQuests";
import { StreakCard } from "./StreakCard";
import { BossBattles } from "./BossBattles";
import { RecentActivities } from "./RecentActivities";
import { FindFriends } from "./FindFriends";
import { Leaderboards } from "./Leaderboards";
import { Profile } from "./Profile";
import { WeeklyRecapCard } from "./WeeklyRecapCard";
import { CollapsibleSection } from "./CollapsibleSection";
import { STAT_KEYS, STAT_ICONS, STAT_LABELS } from "@/lib/types";
import { getActivityById } from "@/lib/activities";

type Tab = "quad" | "me" | "friends" | "leaderboards" | "profile";

function Header({
  username,
  character,
  showLogout,
  onLogout,
}: {
  username: string | null;
  character: Character | null;
  showLogout: boolean;
  onLogout: () => void;
}) {
  const [questsOpen, setQuestsOpen] = useState(false);
  const questsButtonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <header className="sticky top-0 z-10 -mx-4 -mt-4 px-4 pt-4 pb-3 mb-4 sm:mb-5 bg-uri-navy/98 backdrop-blur-md border-b border-uri-keaney/30">
      <div className="max-w-2xl mx-auto relative flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-left">
          {username ? (
            <p className="font-medium text-white truncate text-sm sm:text-base" title={username}>
              @{username}
            </p>
          ) : (
            <span className="text-white/40 text-sm">@username</span>
          )}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-none">
          <div className="flex flex-col items-center text-center pointer-events-none">
            <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
              CampusQuest
            </h1>
            <p className="text-[10px] sm:text-xs text-uri-keaney font-medium">
              URI · Level up for real
            </p>
          </div>
          {character && (
            <div className="pointer-events-auto ml-2 sm:ml-4">
              <button
                ref={questsButtonRef}
                type="button"
                onClick={() => setQuestsOpen((v) => !v)}
                className={`text-lg px-3 py-2 rounded-xl border transition-colors ${
                  questsOpen
                    ? "bg-uri-keaney/25 text-uri-keaney border-uri-keaney/50"
                    : "bg-white/15 text-white border-white/25 hover:bg-white/20 hover:border-white/30"
                }`}
                aria-haspopup="dialog"
                aria-expanded={questsOpen}
                title="Daily quests"
              >
                📋 <span className="text-white/70">▾</span>
              </button>
              {questsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setQuestsOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 z-40 w-[min(34rem,92vw)]">
                    <div className="rounded-2xl border border-uri-keaney/40 bg-[#041E42] shadow-xl shadow-black/40">
                      <DailyQuests character={character} compact />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex justify-end">
          {showLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-medium text-uri-keaney/90 hover:text-uri-keaney hover:bg-uri-keaney/10 px-3 py-2 rounded-xl border border-uri-keaney/30 transition-colors"
              aria-label="Log out"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Dashboard() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(true);
  const [tab, setTab] = useState<Tab>("quad");
  const [gainToast, setGainToast] = useState<null | { xp: number; stats: Partial<Record<keyof Character["stats"], number>>; title: string }>(null);

  const refresh = useCallback(() => {
    setCharacter(getCharacter());
  }, []);

  const handleLogout = useCallback(() => {
    storeLogout();
    setCharacter(null);
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-white/10 w-3/4 max-w-xs" />
        <div className="card p-5 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/10 rounded w-24" />
              <div className="h-3 bg-white/10 rounded w-full mt-3" />
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
        </div>
        <div className="card p-4 space-y-2">
          <div className="h-4 bg-white/10 rounded w-40" />
          <div className="h-11 bg-white/10 rounded-xl" />
          <div className="h-11 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!character) {
    return showWelcomeSplash ? (
      <WelcomeSplash onComplete={() => setShowWelcomeSplash(false)} />
    ) : (
      <>
        <Header username={null} character={null} showLogout={false} onLogout={handleLogout} />
        <CharacterGate onReady={refresh} />
      </>
    );
  }

  function handleLog(activityId: string, options?: { minutes?: number; proofUrl?: string; tags?: string[] }) {
    if (!character) return null;
    const before = character;
    const updated = logActivity(character.id, activityId, options);
    if (updated) {
      setCharacter(updated);
      const def = getActivityById(activityId);
      const xp = Math.max(0, updated.totalXP - before.totalXP);
      const stats: Partial<Record<keyof Character["stats"], number>> = {};
      for (const k of STAT_KEYS) {
        const delta = (updated.stats?.[k] ?? 0) - (before.stats?.[k] ?? 0);
        if (delta > 0) stats[k] = delta;
      }
      setGainToast({
        xp,
        stats,
        title: def ? `${def.icon} ${def.label}` : "Activity logged",
      });
      window.setTimeout(() => setGainToast(null), 3200);
    }
    return updated;
  }

  return (
    <>
      <Header username={character?.username ?? null} character={character} showLogout onLogout={handleLogout} />
      <div className="space-y-5 sm:space-y-6">
        {gainToast && (
          <div className="fixed left-1/2 top-20 -translate-x-1/2 z-40 w-[min(28rem,92vw)]">
            <div className="card px-4 py-3 border border-uri-keaney/35 bg-uri-navy/95 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">{gainToast.title}</div>
                  <div className="text-xs text-white/60 mt-0.5">
                    <span className="font-mono text-uri-keaney">+{gainToast.xp} XP</span>
                    {Object.keys(gainToast.stats).length > 0 && <span className="text-white/40"> · </span>}
                    {STAT_KEYS.filter((k) => (gainToast.stats as any)[k] > 0).map((k) => (
                      <span key={k} className="mr-2">
                        {STAT_ICONS[k]} <span className="text-white/80">+{(gainToast.stats as any)[k]}</span>
                        <span className="text-white/40"> {STAT_LABELS[k]}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGainToast(null)}
                  className="text-white/40 hover:text-white/70"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
        <nav className="flex rounded-2xl bg-white/10 border border-uri-keaney/20 p-1.5" aria-label="Main">
          <button
            type="button"
            onClick={() => setTab("quad")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "quad" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            The Quad
          </button>
          <button
            type="button"
            onClick={() => setTab("friends")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "friends" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            Find Friends
          </button>
          <button
            type="button"
            onClick={() => setTab("leaderboards")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "leaderboards" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            Leaderboards
          </button>
          <button
            type="button"
            onClick={() => setTab("me")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "me" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            My character
          </button>
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "profile" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            Profile
          </button>
        </nav>

      {tab === "quad" && (
        <>
          <TheQuad character={character} onRefresh={refresh} />
          <StreakCard character={character} />
          <BossBattles character={character} onRefresh={refresh} />
        </>
      )}

      {tab === "friends" && (
        <FindFriends character={character} onRefresh={refresh} />
      )}

      {tab === "leaderboards" && (
        <Leaderboards character={character} />
      )}

      {tab === "profile" && (
        <Profile character={character} />
      )}

      {tab === "me" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="md:col-span-2">
            <CharacterCard character={character} onRefresh={refresh} />
          </div>
          <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-stretch md:col-span-2 md:gap-5">
            <div className="flex-1 min-w-0">
              <StreakCard character={character} />
            </div>
            <div className="flex-1 min-w-0">
              <CollapsibleSection title="Weekly recap" defaultCollapsed>
                <WeeklyRecapCard character={character} />
              </CollapsibleSection>
            </div>
          </div>
          <div className="md:col-span-2">
            <ActivityList onLog={handleLog} />
          </div>
          <div className="min-w-0">
            <CollapsibleSection title="Recent activities" defaultCollapsed>
              <RecentActivities characterId={character.id} />
            </CollapsibleSection>
          </div>
          <div className="md:col-span-2">
            <BossBattles character={character} onRefresh={refresh} />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
