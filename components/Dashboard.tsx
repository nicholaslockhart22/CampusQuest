"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
import { DirectMessageThread } from "./DirectMessageThread";
import { STAT_KEYS, STAT_ICONS, STAT_LABELS } from "@/lib/types";
import { getActivityById } from "@/lib/activities";
import { getConversationsForUser } from "@/lib/dmStore";
import { AvatarDisplay } from "./AvatarDisplay";

type Tab = "quad" | "me" | "friends" | "leaderboards" | "profile";

function Header({
  username,
  character,
  showLogout,
  onLogout,
  onRefresh,
  onOpenDm,
}: {
  username: string | null;
  character: Character | null;
  showLogout: boolean;
  onLogout: () => void;
  onRefresh?: () => void;
  onOpenDm?: (other: { userId: string; username: string; name: string; avatar: string }) => void;
}) {
  const [questsOpen, setQuestsOpen] = useState(false);
  const [specialQuestsOpen, setSpecialQuestsOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const questsButtonRef = useRef<HTMLButtonElement | null>(null);
  const conversations = character ? getConversationsForUser(character.id) : [];

  function handleLogoutClick() {
    setShowLogoutConfirm(true);
  }

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    onLogout();
  }

  return (
    <>
    <header
      className={`sticky top-0 -mx-4 -mt-4 mb-4 sm:mb-5 transition-z-index ${dmOpen || questsOpen || specialQuestsOpen ? "z-[110]" : "z-10"}`}
      style={{
        background: "linear-gradient(180deg, rgba(4, 30, 66, 0.98) 0%, rgba(3, 22, 48, 0.97) 100%)",
        boxShadow: "0 1px 0 0 rgba(104, 171, 232, 0.15), 0 4px 20px -4px rgba(0,0,0,0.4)",
      }}
    >
      <div className="backdrop-blur-sm border-b border-white/[0.08]">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Left: Brand + user */}
          <div className="min-w-0 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-uri-keaney/30 to-uri-keaney/10 border border-uri-keaney/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(104,171,232,0.2)]">
              <span className="text-base font-bold text-uri-keaney leading-none">CQ</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white text-sm sm:text-base tracking-tight truncate">
                CampusQuest
              </h1>
              <p className="text-[10px] sm:text-xs text-uri-keaney/80 font-medium truncate">
                {username ? `@${username}` : "URI · Level up for real"}
              </p>
            </div>
          </div>

          {/* Right: Quick actions + logout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {character && (
              <div
                className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1 gap-0.5 shadow-inner"
                role="group"
                aria-label="Quick actions"
              >
                {onOpenDm && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setQuestsOpen(false);
                        setSpecialQuestsOpen(false);
                        setDmOpen((v) => !v);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        dmOpen
                          ? "bg-uri-keaney/25 text-uri-keaney border border-uri-keaney/40 shadow-sm"
                          : "text-white/90 hover:bg-white/10 hover:text-white border border-transparent"
                      }`}
                      aria-haspopup="dialog"
                      aria-expanded={dmOpen}
                      title="Direct messages"
                    >
                      <span aria-hidden>💬</span>
                      <span className="hidden sm:inline">Messages</span>
                      <span className="text-[10px] opacity-70" aria-hidden>{dmOpen ? "▴" : "▾"}</span>
                    </button>
                    {dmOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[100] bg-black/30 cursor-default"
                          onClick={() => setDmOpen(false)}
                          aria-hidden
                        />
                        <div className="absolute right-0 top-full mt-2 z-[101] w-[min(20rem,92vw)]">
                          <div className="rounded-2xl border border-uri-keaney/40 bg-[#041E42] shadow-xl shadow-black/40 overflow-hidden ring-1 ring-black/20">
                            <div className="px-3 py-2.5 border-b border-white/10 bg-white/5">
                              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Direct messages</p>
                            </div>
                            <ul className="max-h-[70vh] overflow-y-auto p-2">
                              {conversations.length === 0 ? (
                                <li className="text-sm text-white/50 py-6 text-center">No conversations yet.</li>
                              ) : (
                                conversations.map((conv) => (
                                  <li key={conv.conversationId}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenDm({
                                          userId: conv.otherUserId,
                                          username: conv.otherUsername,
                                          name: conv.otherName,
                                          avatar: conv.otherAvatar,
                                        });
                                        setDmOpen(false);
                                      }}
                                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-uri-keaney/30">
                                        <AvatarDisplay avatar={conv.otherAvatar} size={36} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-white text-sm truncate">{conv.otherName}</p>
                                        <p className="text-xs text-white/50 truncate">{conv.lastMessage}</p>
                                      </div>
                                    </button>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="relative">
                  <button
                    ref={questsButtonRef}
                    type="button"
                    onClick={() => {
                      setSpecialQuestsOpen(false);
                      setDmOpen(false);
                      setQuestsOpen((v) => !v);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      questsOpen
                        ? "bg-uri-keaney/25 text-uri-keaney border border-uri-keaney/40 shadow-sm"
                        : "text-white/90 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                    aria-haspopup="dialog"
                    aria-expanded={questsOpen}
                    title="Daily quests"
                  >
                    <span aria-hidden>📋</span>
                    <span className="hidden sm:inline">Daily</span>
                    <span className="text-[10px] opacity-70" aria-hidden>{questsOpen ? "▴" : "▾"}</span>
                  </button>
                  {questsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100] bg-black/30 cursor-default"
                        onClick={() => setQuestsOpen(false)}
                        aria-hidden
                      />
                      <div className="absolute right-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 top-full mt-2 z-[101] w-[min(34rem,92vw)]">
                        <div className="rounded-2xl border border-uri-keaney/40 bg-[#041E42] shadow-xl shadow-black/40 ring-1 ring-black/20">
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
                      setDmOpen(false);
                      setSpecialQuestsOpen((v) => !v);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      specialQuestsOpen
                        ? "bg-uri-gold/20 text-uri-gold border border-uri-gold/50 shadow-sm"
                        : "text-white/90 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                    aria-haspopup="dialog"
                    aria-expanded={specialQuestsOpen}
                    title="Special quests"
                  >
                    <span aria-hidden>⭐</span>
                    <span className="hidden sm:inline">Special</span>
                    <span className="text-[10px] opacity-70" aria-hidden>{specialQuestsOpen ? "▴" : "▾"}</span>
                  </button>
                  {specialQuestsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100] bg-black/30 cursor-default"
                        onClick={() => setSpecialQuestsOpen(false)}
                        aria-hidden
                      />
                      <div className="absolute right-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 top-full mt-2 z-[101] w-[min(34rem,92vw)]">
                        <div
                          className="rounded-2xl overflow-hidden border-2 border-uri-gold/60 bg-[#041E42] ring-1 ring-black/20"
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
            {showLogout && (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
                aria-label="Log out"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>

      {showLogoutConfirm && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-[20rem] rounded-2xl border border-white/15 bg-uri-navy shadow-xl shadow-black/40 p-6">
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
        </div>,
        document.body
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
  const [showLevel3Popup, setShowLevel3Popup] = useState(false);
  const [dmWithOther, setDmWithOther] = useState<{ userId: string; username: string; name: string; avatar: string } | null>(null);

  const XP300_POPUP_KEY = "campusquest_300xp_celebrated";

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

  useEffect(() => {
    if (!character || character.totalXP < 300) return;
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(XP300_POPUP_KEY)) {
        setShowLevel3Popup(true);
      }
    } catch {
      setShowLevel3Popup(true);
    }
  }, [character?.id, character?.totalXP]);

  function dismissLevel3Popup() {
    try {
      if (typeof window !== "undefined") localStorage.setItem(XP300_POPUP_KEY, "1");
    } catch {}
    setShowLevel3Popup(false);
  }

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
      // Show 300 XP celebration when they just reached 300 total XP
      if (before.totalXP < 300 && updated.totalXP >= 300) {
        try {
          if (typeof window !== "undefined" && !localStorage.getItem(XP300_POPUP_KEY)) {
            setShowLevel3Popup(true);
          }
        } catch {
          setShowLevel3Popup(true);
        }
      }
    }
    return updated;
  }

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: "quad", icon: "📋", label: "Quad" },
    { tab: "friends", icon: "👋", label: "Friends" },
    { tab: "me", icon: "⚔️", label: "Character" },
    { tab: "leaderboards", icon: "🏆", label: "Rank" },
    { tab: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <Header username={character?.username ?? null} character={character} showLogout onLogout={handleLogout} onRefresh={refresh} onOpenDm={setDmWithOther} />
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

      {showLevel3Popup && character && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="xp300-title">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismissLevel3Popup} aria-hidden />
          <div
            className="relative z-10 w-full max-w-sm rounded-3xl border-2 border-uri-gold/60 bg-uri-navy p-8 text-center level3-popup-enter level3-popup-glow"
            style={{
              background: "linear-gradient(180deg, rgba(197, 165, 40, 0.12) 0%, rgba(4, 30, 66, 0.98) 30%, #041E42 100%)",
              boxShadow: "0 0 40px rgba(197, 165, 40, 0.4), 0 0 80px rgba(104, 171, 232, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-5xl mb-3" aria-hidden>🎉</div>
            <p className="text-uri-gold font-bold text-2xl mb-1" id="xp300-title">300 XP!</p>
            <p className="text-white font-semibold text-lg mb-2">Congratulations!</p>
            <p className="text-white/80 text-sm mb-6">
              You&apos;ve reached 300 total XP and unlocked <strong className="text-uri-keaney">Create Guild</strong>. Head to Find Friends to start or join a guild and earn bonus XP with other Rams.
            </p>
            <button
              type="button"
              onClick={dismissLevel3Popup}
              className="w-full py-3.5 rounded-xl bg-uri-keaney text-white font-bold text-sm hover:bg-uri-keaney/90 focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:ring-offset-2 focus:ring-offset-uri-navy transition-colors shadow-lg"
            >
              Let&apos;s go!
            </button>
          </div>
        </div>,
        document.body
      )}

      <div key={tab} className="tab-content-enter space-y-5 sm:space-y-6">
        {tab === "quad" && (
          <>
            <TheQuad character={character} onRefresh={refresh} />
            <BossBattles character={character} onRefresh={refresh} />
          </>
        )}

        {tab === "friends" && (
          <FindFriends character={character} onRefresh={refresh} onOpenDm={setDmWithOther} />
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

      {dmWithOther && character && (
        <DirectMessageThread
          currentUser={character}
          otherUser={dmWithOther}
          onClose={() => setDmWithOther(null)}
          onMessageSent={refresh}
        />
      )}
    </>
  );
}
