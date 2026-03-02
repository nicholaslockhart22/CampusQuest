"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Character } from "@/lib/types";
import { AvatarDisplay } from "./AvatarDisplay";
import { DirectMessageThread } from "./DirectMessageThread";

type InboxSubTab = "notifications" | "messages";

const STORAGE_STARRED_NOTIFICATIONS = "campusquest_inbox_starred_notifications";
const STORAGE_STARRED_MESSAGES = "campusquest_inbox_starred_messages";

function loadStarredSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveStarredSet(key: string, set: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify([...set]));
}

/** Filler notifications with ts for sort (most recent first). */
const FILLER_NOTIFICATIONS = [
  { id: "n1", type: "system" as const, icon: "📢", title: "Welcome to CampusQuest", body: "You're all set. Log activities, complete quests, and level up with fellow Rams.", time: "2h ago", ts: Date.now() - 2 * 3600 * 1000 },
  { id: "n2", type: "event" as const, icon: "🎓", title: "URI Spring Career Fair", body: "March 15, 10am–2pm in the Memorial Union. Meet employers and bring your resume.", time: "1d ago", ts: Date.now() - 24 * 3600 * 1000 },
  { id: "n3", type: "activity" as const, icon: "👍", title: "Someone liked your post", body: "Jordan Kim nodded at your Field Note: \"Finished the MTH 215 problem set…\"", time: "3h ago", ts: Date.now() - 3 * 3600 * 1000 },
  { id: "n4", type: "activity" as const, icon: "💬", title: "New comment on your post", body: "Alex Rivera: \"Same, that one was rough. Office hours helped a lot.\"", time: "5h ago", ts: Date.now() - 5 * 3600 * 1000 },
  { id: "n5", type: "event" as const, icon: "🏃", title: "Ram Run 5K", body: "April 6 at 9am. Register at rec.uri.edu. Log your run for bonus XP!", time: "2d ago", ts: Date.now() - 2 * 24 * 3600 * 1000 },
  { id: "n6", type: "system" as const, icon: "⚔️", title: "Boss battle update", body: "You defeated \"Calc Midterm\" and earned +125 XP. Keep it up!", time: "3d ago", ts: Date.now() - 3 * 24 * 3600 * 1000 },
  { id: "n7", type: "activity" as const, icon: "👍", title: "Someone rallied your post", body: "Casey Lee rallied your Field Note about the gym session.", time: "1d ago", ts: Date.now() - 1 * 24 * 3600 * 1000 },
];

/** Filler DMs and guild group messages with ts for sort. */
const FILLER_MESSAGES = [
  { id: "m1", type: "dm" as const, from: "Jordan Kim", fromUsername: "jordan_kim", fromAvatar: "🎓", preview: "Hey! Want to study for the MTH 215 midterm together?", time: "10m ago", ts: Date.now() - 10 * 60 * 1000, userId: "ph-jordan" },
  { id: "m2", type: "dm" as const, from: "Alex Rivera", fromUsername: "alex_rivera", fromAvatar: "📚", preview: "That Field Note was so relatable. Good luck with the rest of the week!", time: "1h ago", ts: Date.now() - 3600 * 1000, userId: "ph-alex" },
  { id: "m3", type: "guild" as const, guildName: "Library Legends", guildCrest: "📚", from: "Quinn Taylor", preview: "Anyone at the library tonight? I'll be there from 6.", time: "2h ago", ts: Date.now() - 2 * 3600 * 1000 },
  { id: "m4", type: "dm" as const, from: "Casey Lee", fromUsername: "casey_lee", fromAvatar: "🦌", preview: "Great run today! We should do the Ram Run 5K together.", time: "5h ago", ts: Date.now() - 5 * 3600 * 1000, userId: "ph-casey" },
  { id: "m5", type: "guild" as const, guildName: "Ram Runners", guildCrest: "🦌", from: "Morgan Blake", preview: "Reminder: group run Saturday 8am at the track. See you there!", time: "1d ago", ts: Date.now() - 24 * 3600 * 1000 },
  { id: "m6", type: "dm" as const, from: "Riley Morgan", fromUsername: "riley_morgan", fromAvatar: "☕", preview: "Thanks for the coffee chat tip. Got so much done in the quiet room.", time: "2d ago", ts: Date.now() - 2 * 24 * 3600 * 1000, userId: "ph-riley" },
];

export function Inbox({
  character,
  onBack,
  onOpenDm,
}: {
  character: Character;
  onBack: () => void;
  onOpenDm?: (other: { userId: string; username: string; name: string; avatar: string }) => void;
}) {
  const [subTab, setSubTab] = useState<InboxSubTab>("notifications");
  const [dmWith, setDmWith] = useState<{ userId: string; username: string; name: string; avatar: string } | null>(null);
  const [starredNotifications, setStarredNotifications] = useState<Set<string>>(() => loadStarredSet(STORAGE_STARRED_NOTIFICATIONS));
  const [starredMessages, setStarredMessages] = useState<Set<string>>(() => loadStarredSet(STORAGE_STARRED_MESSAGES));

  useEffect(() => {
    saveStarredSet(STORAGE_STARRED_NOTIFICATIONS, starredNotifications);
  }, [starredNotifications]);
  useEffect(() => {
    saveStarredSet(STORAGE_STARRED_MESSAGES, starredMessages);
  }, [starredMessages]);

  const toggleStarNotification = useCallback((id: string) => {
    setStarredNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleStarMessage = useCallback((id: string) => {
    setStarredMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sortedNotifications = useMemo(() => {
    return [...FILLER_NOTIFICATIONS].sort((a, b) => {
      const aStar = starredNotifications.has(a.id) ? 0 : 1;
      const bStar = starredNotifications.has(b.id) ? 0 : 1;
      if (aStar !== bStar) return aStar - bStar;
      return b.ts - a.ts;
    });
  }, [starredNotifications]);

  const sortedMessages = useMemo(() => {
    return [...FILLER_MESSAGES].sort((a, b) => {
      const aStar = starredMessages.has(a.id) ? 0 : 1;
      const bStar = starredMessages.has(b.id) ? 0 : 1;
      if (aStar !== bStar) return aStar - bStar;
      return b.ts - a.ts;
    });
  }, [starredMessages]);

  function handleOpenDm(userId: string, username: string, name: string, avatar: string) {
    if (onOpenDm) {
      onOpenDm({ userId, username, name, avatar });
      onBack();
    } else {
      setDmWith({ userId, username, name, avatar });
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Top bar: back + title */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 text-white transition-colors"
          aria-label="Back"
        >
          ←
        </button>
        <h2 className="font-display font-bold text-lg text-white">Inbox</h2>
      </div>

      {/* Sub-tabs */}
      <div className="flex rounded-xl border border-white/15 bg-white/5 p-1 mb-4">
        <button
          type="button"
          onClick={() => setSubTab("notifications")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            subTab === "notifications"
              ? "bg-uri-keaney/25 text-uri-keaney border border-uri-keaney/40"
              : "text-white/70 hover:text-white border border-transparent"
          }`}
        >
          Notifications
        </button>
        <button
          type="button"
          onClick={() => setSubTab("messages")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            subTab === "messages"
              ? "bg-uri-keaney/25 text-uri-keaney border border-uri-keaney/40"
              : "text-white/70 hover:text-white border border-transparent"
          }`}
        >
          Messages
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 card overflow-hidden p-0">
        {subTab === "notifications" && (
          <ul className="divide-y divide-white/10 max-h-[50vh] overflow-y-auto">
            {sortedNotifications.map((n) => (
              <li key={n.id} className="p-4 hover:bg-white/[0.04] transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl flex-shrink-0">
                  {n.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-sm">{n.title}</p>
                  <p className="text-white/70 text-sm mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-white/40 text-xs mt-1">{n.time}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStarNotification(n.id); }}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ${starredNotifications.has(n.id) ? "text-uri-gold" : "text-white/50 hover:text-uri-gold"} hover:bg-uri-gold/10`}
                  aria-label={starredNotifications.has(n.id) ? "Unstar" : "Star"}
                  title={starredNotifications.has(n.id) ? "Unstar" : "Star to keep at top"}
                >
                  {starredNotifications.has(n.id) ? "★" : "☆"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {subTab === "messages" && (
          <ul className="divide-y divide-white/10 max-h-[50vh] overflow-y-auto">
            {sortedMessages.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                {m.type === "dm" ? (
                  <button
                    type="button"
                    onClick={() => onOpenDm && handleOpenDm(m.userId, m.fromUsername, m.from, m.fromAvatar)}
                    className="flex-1 min-w-0 flex items-center gap-3 p-4 hover:bg-white/[0.04] text-left transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-uri-keaney/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <AvatarDisplay avatar={m.fromAvatar} size={44} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm truncate">{m.from}</p>
                      <p className="text-white/60 text-sm truncate">{m.preview}</p>
                      <p className="text-white/40 text-xs mt-0.5">{m.time}</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex-1 min-w-0 flex items-center gap-3 p-4">
                    <div className="w-11 h-11 rounded-xl bg-uri-keaney/20 border border-uri-keaney/30 flex items-center justify-center text-xl flex-shrink-0">
                      {m.guildCrest}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white/50 text-xs font-medium">{m.guildName} · {m.from}</p>
                      <p className="text-white/80 text-sm truncate mt-0.5">{m.preview}</p>
                      <p className="text-white/40 text-xs mt-0.5">{m.time}</p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStarMessage(m.id); }}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ${starredMessages.has(m.id) ? "text-uri-gold" : "text-white/50 hover:text-uri-gold"} hover:bg-uri-gold/10`}
                  aria-label={starredMessages.has(m.id) ? "Unstar" : "Star"}
                  title={starredMessages.has(m.id) ? "Unstar" : "Star to keep at top"}
                >
                  {starredMessages.has(m.id) ? "★" : "☆"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dmWith && (
        <DirectMessageThread
          currentUser={character}
          otherUser={dmWith}
          onClose={() => setDmWith(null)}
          onMessageSent={() => {}}
        />
      )}
    </div>
  );
}
