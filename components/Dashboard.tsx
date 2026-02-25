"use client";

import { useState, useEffect, useCallback } from "react";
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

type Tab = "quad" | "me" | "friends" | "leaderboards" | "profile";

function Header({ showLogout, onLogout }: { showLogout: boolean; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-10 -mx-4 -mt-4 px-4 pt-4 pb-3 mb-4 sm:mb-5 bg-uri-navy/98 backdrop-blur-md border-b border-uri-keaney/30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/campusquest-logo.png"
            alt=""
            className="h-7 sm:h-8 w-auto flex-shrink-0 object-contain"
            aria-hidden
          />
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight truncate">
              CampusQuest
            </h1>
            <p className="text-[10px] sm:text-xs text-uri-keaney font-medium hidden sm:block">
              URI · Level up for real
            </p>
          </div>
        </div>
        {showLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex-shrink-0 text-xs font-medium text-uri-keaney/90 hover:text-uri-keaney hover:bg-uri-keaney/10 px-3 py-2 rounded-xl border border-uri-keaney/30 transition-colors"
            aria-label="Log out"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
}

export function Dashboard() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(true);
  const [tab, setTab] = useState<Tab>("quad");

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
        <Header showLogout={false} onLogout={handleLogout} />
        <CharacterGate onReady={refresh} />
      </>
    );
  }

  function handleLog(activityId: string, options?: { minutes?: number; proofUrl?: string; tags?: string[] }) {
    if (!character) return null;
    const updated = logActivity(character.id, activityId, options);
    if (updated) setCharacter(updated);
    return updated;
  }

  return (
    <>
      <Header showLogout onLogout={handleLogout} />
      <div className="space-y-5 sm:space-y-6">
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
            onClick={() => setTab("profile")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "profile" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setTab("me")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "me" ? "bg-uri-keaney text-white shadow-md" : "text-white/80 hover:text-uri-keaney hover:bg-uri-keaney/10"}`}
          >
            My character
          </button>
        </nav>

      {tab === "quad" && (
        <>
          <TheQuad character={character} onRefresh={refresh} />
          <StreakCard character={character} />
          <DailyQuests character={character} />
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
        <>
          <CharacterCard character={character} onRefresh={refresh} />
          <ActivityList onLog={handleLog} />
          <RecentActivities characterId={character.id} />
          <StreakCard character={character} />
          <DailyQuests character={character} />
          <BossBattles character={character} onRefresh={refresh} />
        </>
      )}
      </div>
    </>
  );
}
