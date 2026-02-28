"use client";

import { createPortal } from "react-dom";
import type { Guild } from "@/lib/types";
import { GUILD_INTEREST_LABELS } from "@/lib/guildStore";
import { getCharacterById } from "@/lib/friendsStore";
import { AvatarDisplay } from "./AvatarDisplay";

function guildDisplayLevel(guild: Guild): number {
  return guild.xp != null ? 1 + Math.floor(guild.xp / 100) : guild.level;
}

export function ViewGuildModal({
  guild,
  currentUserId,
  onLeave,
  onClose,
}: {
  guild: Guild;
  currentUserId?: string;
  onLeave?: (guildId: string) => void;
  onClose: () => void;
}) {
  const creator = guild.createdByUserId ? getCharacterById(guild.createdByUserId) : null;
  const isMember = currentUserId != null && guild.memberIds.includes(currentUserId);
  const memberChars = guild.memberIds.map((id) => getCharacterById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCharacterById>>[];
  const level = guildDisplayLevel(guild);

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-labelledby="view-guild-title" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-[22rem] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-uri-navy shadow-xl shadow-black/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-uri-keaney/20 to-uri-navy flex items-center justify-center text-3xl border border-uri-keaney/30">
              {guild.crest}
            </div>
            <div>
              <h2 id="view-guild-title" className="font-display font-semibold text-lg text-white">
                {guild.name}
              </h2>
              <p className="text-xs text-white/60">{GUILD_INTEREST_LABELS[guild.interest]} · Lv.{level}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm mb-4">
            <p><span className="text-white/50">Weekly goal:</span> <span className="text-white/90">{guild.weeklyQuestGoal}</span></p>
            {creator && (
              <p className="text-white/70">
                <span className="text-white/50">Founder:</span> {creator.name} <span className="text-uri-keaney/90">@{creator.username}</span>
              </p>
            )}
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Members ({guild.memberIds.length})</p>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {guild.memberIds.length === 0 ? (
                <li className="text-sm text-white/50">No members yet.</li>
              ) : (
                guild.memberIds.map((id) => {
                  const c = getCharacterById(id);
                  return (
                    <li key={id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {c ? <AvatarDisplay avatar={c.avatar} size={36} /> : <span className="text-lg opacity-60">👤</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        {c ? (
                          <>
                            <p className="font-medium text-white text-sm truncate">{c.name}</p>
                            <p className="text-xs text-white/50 truncate">@{c.username} · Lv.{c.level}</p>
                          </>
                        ) : (
                          <p className="text-sm text-white/50 truncate">Unknown member</p>
                        )}
                      </div>
                      {id === guild.createdByUserId && (
                        <span className="text-[10px] font-semibold text-uri-gold px-1.5 py-0.5 rounded bg-uri-gold/20">Founder</span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {isMember && onLeave && (
              <button
                type="button"
                onClick={() => { onLeave(guild.id); onClose(); }}
                className="w-full py-2.5 rounded-xl font-medium text-amber-400/90 border border-amber-400/40 hover:bg-amber-400/10 transition-colors"
              >
                Leave guild
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-medium bg-white/10 text-white border border-white/15 hover:bg-white/15"
            >
              Close
            </button>
          </div>
        </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
