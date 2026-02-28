"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCharacter, logActivity, logout as storeLogout } from "@/lib/store";
import type { Character } from "@/lib/types";
import { CharacterCard } from "./CharacterCard";
import { CharacterGate } from "./CharacterGate";
import { WelcomeSplash } from "./WelcomeSplash";
import { AuthScreen } from "./AuthScreen";
import { ActivityList } from "./ActivityList";
import { TheQuad } from "./TheQuad";
import { DailyQuests } from "./DailyQuests";
import { SpecialQuests } from "./SpecialQuests";
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
  onRefresh,
}: {
  username: string | null;
  character: Character | null;
  showLogout: boolean;
  onLogout: () => void;
  onRefresh?: () => void;
}) {
  const [questsOpen, setQuestsOpen] = useState(false);
  const [specialQuestsOpen, setSpecialQuestsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const questsButtonRef = useRef<HTMLButtonElement | null>(null);

  function handleLogoutClick() {
    setShowLogoutConfirm(true);
  }

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    onLogout();
  }

  return (
    <>
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
            <div className="pointer-events-auto ml-2 sm:ml-4 flex items-center gap-2">
              <div className="relative">
                <button
                  ref={questsButtonRef}
                  type="button"
                  onClick={() => {
                    setSpecialQuestsOpen(false);
                    setQuestsOpen((v) => !v);
                  }}
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
                      className="fixed inset-0 z-30 bg-black/30 cursor-default"
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setQuestsOpen(false);
                    setSpecialQuestsOpen((v) => !v);
                  }}
                  className={`text-lg px-3 py-2 rounded-xl border transition-colors ${
                    specialQuestsOpen
                      ? "bg-uri-gold/20 text-uri-gold border-uri-gold/50"
                      : "bg-white/15 text-white border-white/25 hover:bg-white/20 hover:border-white/30"
                  }`}
                  aria-haspopup="dialog"
                  aria-expanded={specialQuestsOpen}
                  title="Special quests"
                >
                  ⭐ <span className="text-white/70">▾</span>
                </button>
                {specialQuestsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30 bg-black/30 cursor-default"
                      onClick={() => setSpecialQuestsOpen(false)}
                      aria-hidden
                    />
                    <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 z-40 w-[min(34rem,92vw)]">
                      <div
                        className="rounded-2xl overflow-hidden border-2 border-uri-gold/60 bg-[#041E42]"
                        style={{
                          boxShadow: "0 0 0 1px rgba(197, 165, 40, 0.25), 0 12px 40px -8px rgba(0,0,0,0.5), 0 0 40px rgba(197, 165, 40, 0.12)",
                          background: "linear-gradient(175deg, rgba(197, 165, 40, 0.12) 0%, rgba(197, 165, 40, 0.04) 8%, #041E42 18%, #041E42 100%)",
                        }}
                      >
                        <div className="h-1.5 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" aria-hidden />
                        <div className="h-px bg-gradient-to-r from-transparent via-uri-gold/40 to-transparent" aria-hidden />
                        <SpecialQuests character={character} compact onClaim={onRefresh ?? undefined} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex justify-end">
          {showLogout && (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="text-xs font-medium text-uri-keaney/90 hover:text-uri-keaney hover:bg-uri-keaney/10 px-3 py-2 rounded-xl border border-uri-keaney/30 transition-colors"
              aria-label="Log out"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>

      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(20rem,92vw)] rounded-2xl border border-white/15 bg-uri-navy shadow-xl shadow-black/40 p-6"
            role="dialog"
            aria-labelledby="logout-dialog-title"
            aria-modal="true"
          >
            <h2 id="logout-dialog-title" className="font-display font-semibold text-lg text-white mb-2">
              Leave CampusQuest?
            </h2>
            <p className="text-sm text-white/70 mb-6">
              The Quad shall wait for your return.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-uri-keaney hover:bg-uri-keaney/90 border border-uri-keaney/40 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function Dashboard() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(true);
  const [tab, setTab] = useState<Tab>("quad");
  const [gainToast, setGainToast] = useState<null | { xp: number; stats: Partial<Record<keyof Character["stats"], number>>; title: string }>(null);

  const refresh = useCallback(() => {
    setCharacter(getCharacter());
  }, []);

  const handleLogout = useCallback(() => {
    storeLogout();
    setCharacter(null);
    setShowAuthScreen(true);
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
    if (showWelcomeSplash) {
      return <WelcomeSplash onComplete={() => setShowWelcomeSplash(false)} />;
    }
    if (showAuthScreen) {
      return (
        <AuthScreen onComplete={() => setShowAuthScreen(false)} />
      );
    }
    return (
      <>
        <Header username={null} character={null} showLogout={false} onLogout={handleLogout} onRefresh={refresh} />
        <CharacterGate onReady={() => { refresh(); setTab("quad"); }} />
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

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: "quad", icon: "📋", label: "Quad" },
    { tab: "friends", icon: "👋", label: "Friends" },
    { tab: "leaderboards", icon: "🏆", label: "Rank" },
    { tab: "me", icon: "⚔️", label: "Character" },
    { tab: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <Header username={character?.username ?? null} character={character} showLogout onLogout={handleLogout} onRefresh={refresh} />
      <div style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}>
        {gainToast && (
          <div className="fixed left-1/2 top-20 -translate-x-1/2 z-40 w-[min(28rem,92vw)] toast-enter">
            <div className="card px-4 py-3 border border-uri-keaney/40 bg-uri-navy shadow-keaney">
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

      <div key={tab} className="tab-content-enter space-y-5 sm:space-y-6">
        {tab === "quad" && (
          <>
            <TheQuad character={character} onRefresh={refresh} />
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
            <div className="md:col-span-2">
              <StreakCard character={character} />
            </div>
            <div className="md:col-span-2">
              <CollapsibleSection title="Weekly recap" defaultCollapsed>
                <WeeklyRecapCard character={character} />
              </CollapsibleSection>
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
      </div>

      {/* Bottom nav — width aligned with main content */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-4 flex justify-center"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <nav
          className="w-full max-w-2xl mx-auto flex items-center justify-around rounded-t-xl bg-uri-navy border border-b-0 border-uri-keaney/20 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.35),0_-1px_0_0_rgba(104,171,232,0.08)]"
          style={{ paddingTop: "0.5rem", paddingBottom: "0.75rem" }}
          aria-label="Main navigation"
        >
        {navItems.map(({ tab: t, icon, label }) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-2.5 px-1 rounded-xl transition-colors touch-manipulation ${
              tab === t ? "text-uri-keaney bg-uri-keaney/15" : "text-white/60 active:text-white/80 active:bg-white/5"
            }`}
            aria-current={tab === t ? "page" : undefined}
          >
            <span className="text-xl leading-none" aria-hidden>{icon}</span>
            <span className={`text-xs font-bold truncate w-full text-center ${tab === t ? "text-uri-keaney" : "text-white/90"}`}>{label}</span>
          </button>
        ))}
        </nav>
      </div>
    </>
  );
}
