"use client";

import type { Guild, GuildInterest } from "@/lib/types";
import { GUILD_INTEREST_LABELS } from "@/lib/guildStore";

export function GuildCard({
  guild,
  currentUserId,
  userGuildId,
  hasRequestedInvite,
  onJoin,
  onRequestInvite,
  onView,
}: {
  guild: Guild;
  currentUserId: string;
  userGuildId: string | undefined;
  hasRequestedInvite: boolean;
  onJoin: (guildId: string) => void;
  onRequestInvite: (guildId: string) => void;
  onView: (guild: Guild) => void;
}) {
  const isMember = guild.memberIds.includes(currentUserId);
  const memberCount = guild.memberIds.length;

  return (
    <div className="p-4 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.08] transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-uri-keaney/20 to-uri-navy flex items-center justify-center text-2xl border border-uri-keaney/30 flex-shrink-0">
          {guild.crest}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-white truncate">{guild.name}</h4>
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/15 text-white/70">
              {GUILD_INTEREST_LABELS[guild.interest]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
            <span>Lv.{guild.level}</span>
            <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-sm text-white/80 mt-2 line-clamp-2">{guild.weeklyQuestGoal}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => onView(guild)}
              className="text-xs font-medium text-uri-keaney hover:text-uri-keaney/80 px-2.5 py-1.5 rounded-lg border border-uri-keaney/30 hover:bg-uri-keaney/10 transition-colors"
            >
              View Guild
            </button>
            {isMember ? (
              <span className="text-xs text-uri-gold/90 font-medium px-2.5 py-1.5">Member</span>
            ) : hasRequestedInvite ? (
              <span className="text-xs text-white/50 px-2.5 py-1.5">Request sent</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onJoin(guild.id)}
                  className="text-xs font-medium text-white/90 hover:text-white px-2.5 py-1.5 rounded-lg bg-uri-keaney/80 hover:bg-uri-keaney border border-uri-keaney/40 transition-colors"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => onRequestInvite(guild.id)}
                  className="text-xs font-medium text-white/80 hover:text-white/90 px-2.5 py-1.5 rounded-lg border border-white/25 hover:bg-white/10 transition-colors"
                >
                  Request Invite
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
