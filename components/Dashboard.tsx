"use client";

import { useState, useEffect, useCallback } from "react";
import { getCharacter, logActivity, logout as storeLogout } from "@/lib/store";
import type { Character } from "@/lib/types";
import { CharacterCard } from "./CharacterCard";
import { CharacterGate } from "./CharacterGate";
import { ActivityList } from "./ActivityList";
import { TheQuad } from "./TheQuad";
import { DailyQuests } from "./DailyQuests";
import { StreakCard } from "./StreakCard";
import { BossBattles } from "./BossBattles";
import { RecentActivities } from "./RecentActivities";

type Tab = "quad" | "me";

function Header({ showLogout, onLogout }: { showLogout: boolean; onLogout: () => void }) {
  return (
    <header className="border-b border-uri-keaney/30 bg-uri-navy/95 backdrop-blur-md sticky top-0 z-10 shadow-lg shadow-black/10 -mx-4 px-4 -mt-6 pt-6 mb-6">
      <div className="max-w-2xl mx-auto py-3.5 flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden>🐏</span>
          CampusQuest
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-uri-keaney/90 font-mono hidden sm:inline">
            URI · The Quad · Level up IRL
          </span>
          {showLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
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
      <div className="animate-pulse rounded-2xl bg-white/5 h-64 border border-white/10" />
    );
  }

  if (!character) {
    return (
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
      <div className="space-y-6">
        {/* Tabs — Figma-style pill switcher */}
      <div className="flex rounded-2xl bg-white/10 border border-white/20 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setTab("quad")}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "quad" ? "bg-uri-white text-uri-navy shadow-md" : "text-white/80 hover:text-white hover:bg-white/10"}`}
        >
          The Quad
        </button>
        <button
          type="button"
          onClick={() => setTab("me")}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "me" ? "bg-uri-white text-uri-navy shadow-md" : "text-white/80 hover:text-white hover:bg-white/10"}`}
        >
          My character
        </button>
      </div>

      {tab === "quad" && (
        <>
          <TheQuad character={character} onRefresh={refresh} />
          <StreakCard character={character} />
          <DailyQuests character={character} />
          <BossBattles character={character} onRefresh={refresh} />
        </>
      )}

      {tab === "me" && (
        <>
          <CharacterCard character={character} />
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
