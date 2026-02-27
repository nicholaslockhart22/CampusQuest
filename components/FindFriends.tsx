"use client";

import { useState, useCallback, useEffect } from "react";
import {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptRequest,
  declineRequest,
} from "@/lib/friendsStore";
import type { Character } from "@/lib/types";
import type { Friend, FriendRequest } from "@/lib/types";
import { STAT_KEYS, STAT_LABELS, STAT_ICONS } from "@/lib/types";
import { AvatarDisplay } from "./AvatarDisplay";

export function FindFriends({
  character,
  onRefresh,
}: {
  character: Character;
  onRefresh?: () => void;
}) {
  const [usernameInput, setUsernameInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  const refresh = useCallback(() => {
    setIncoming(getIncomingRequests(character.username));
    setOutgoing(getOutgoingRequests(character.id));
    setFriends(getFriends(character.id));
    onRefresh?.();
  }, [character.id, character.username, onRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    setSendError(null);
    const result = sendFriendRequest(character, usernameInput);
    if (result.ok) {
      setUsernameInput("");
      refresh();
    } else {
      setSendError(result.error ?? "Could not send request.");
    }
  }

  function handleAccept(id: string) {
    acceptRequest(id, character);
    refresh();
  }

  function handleDecline(id: string) {
    declineRequest(id);
    refresh();
  }

  return (
    <section className="space-y-5">
      <div className="card p-4 sm:p-5">
        <h2 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
          <span aria-hidden>👋</span> Find Friends
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Send a friend request by username. See their level and stats once they accept.
        </p>
        <form onSubmit={handleSendRequest} className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
            placeholder="e.g. alex_rhody"
            className="flex-1 min-w-[140px] px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/60"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl font-semibold bg-uri-keaney text-white hover:bg-uri-keaney/90 transition-colors"
          >
            Send request
          </button>
        </form>
        {sendError && <p className="text-sm text-amber-400 mt-2">{sendError}</p>}
      </div>

      {incoming.length > 0 && (
        <div className="card p-4 sm:p-5">
          <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
            <span aria-hidden>📬</span> Requests ({incoming.length})
          </h3>
          <ul className="space-y-3">
            {incoming.map((req) => (
              <li
                key={req.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-2xl">{req.fromAvatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{req.fromName}</p>
                  <p className="text-sm text-uri-keaney/90">@{req.fromUsername}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-uri-keaney text-white hover:bg-uri-keaney/90"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(req.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 border border-white/20"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="card p-4 sm:p-5">
          <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
            <span aria-hidden>📤</span> Pending ({outgoing.length})
          </h3>
          <ul className="space-y-2">
            {outgoing.map((req) => (
              <li
                key={req.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-xl">{req.fromAvatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 truncate">Request sent to @{req.toUsername}</p>
                </div>
                <span className="text-xs text-white/50 font-medium">Pending</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-4 sm:p-5">
        <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
          <span aria-hidden>🦌</span> Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-sm text-white/50">No friends yet. Send a request or accept one above.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <FriendCard key={friend.userId} friend={friend} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  return (
    <li className="p-4 rounded-xl bg-white/5 border border-uri-keaney/20">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-uri-keaney/25 to-uri-navy flex items-center justify-center border border-uri-keaney/30 flex-shrink-0 overflow-hidden">
          <AvatarDisplay avatar={friend.avatar} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{friend.name}</p>
          <p className="text-sm text-uri-keaney/90">@{friend.username}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-uri-keaney font-mono text-sm font-semibold bg-uri-keaney/15 px-1.5 py-0.5 rounded">
              Lv.{friend.level}
            </span>
            <span className="text-white/50 text-sm font-mono">{friend.totalXP} XP</span>
            {friend.streakDays > 0 && (
              <span className="text-amber-400/90 text-xs">🔥 {friend.streakDays}d streak</span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-1.5">
            {STAT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <span title={STAT_LABELS[key]}>{STAT_ICONS[key]}</span>
                <span className="text-white/70">{STAT_LABELS[key]}</span>
                <span className="font-mono text-white/90">{friend.stats[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
