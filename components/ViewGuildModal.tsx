"use client";

import type { Guild } from "@/lib/types";
import { GUILD_INTEREST_LABELS } from "@/lib/guildStore";

export function ViewGuildModal({ guild, onClose }: { guild: Guild; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(22rem,92vw)] rounded-2xl border border-white/15 bg-uri-navy shadow-xl shadow-black/40 p-6"
        role="dialog"
        aria-labelledby="view-guild-title"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-uri-keaney/20 to-uri-navy flex items-center justify-center text-3xl border border-uri-keaney/30">
            {guild.crest}
          </div>
          <div>
            <h2 id="view-guild-title" className="font-display font-semibold text-lg text-white">
              {guild.name}
            </h2>
            <p className="text-xs text-white/60">{GUILD_INTEREST_LABELS[guild.interest]} · Lv.{guild.level}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p><span className="text-white/50">Members:</span> <span className="text-white font-medium">{guild.memberIds.length}</span></p>
          <p><span className="text-white/50">Weekly goal:</span> <span className="text-white/90">{guild.weeklyQuestGoal}</span></p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl font-medium bg-white/10 text-white border border-white/15 hover:bg-white/15"
        >
          Close
        </button>
      </div>
    </>
  );
}
