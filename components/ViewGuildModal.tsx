"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Guild } from "@/lib/types";
import { GUILD_INTEREST_LABELS, deleteGuild, setGuildCofounder, MAX_GUILD_MEMBERS, COFOUNDER_REQUIRED_AT_MEMBERS } from "@/lib/guildStore";
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
  onDeleted,
  onUpdated,
}: {
  guild: Guild;
  currentUserId?: string;
  onLeave?: (guildId: string) => void;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const creator = guild.createdByUserId ? getCharacterById(guild.createdByUserId) : null;
  const isMember = currentUserId != null && guild.memberIds.includes(currentUserId);
  const isCreator = currentUserId != null && guild.createdByUserId === currentUserId;
  const level = guildDisplayLevel(guild);
  const needsCofounder = guild.memberIds.length > COFOUNDER_REQUIRED_AT_MEMBERS && !guild.cofounderUserId;

  function handleConfirmDelete() {
    if (!currentUserId) return;
    if (deleteGuild(guild.id, currentUserId)) {
      setShowDeleteConfirm(false);
      onDeleted?.();
      onClose();
    }
  }

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
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Members ({guild.memberIds.length}/{MAX_GUILD_MEMBERS})
            </p>
            {needsCofounder && isCreator && (
              <p className="text-xs text-amber-400/90 mb-2">Assign a co-founder so new members can join (required for 10+ members).</p>
            )}
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {guild.memberIds.length === 0 ? (
                <li className="text-sm text-white/50">No members yet.</li>
              ) : (
                guild.memberIds.map((id) => {
                  const c = getCharacterById(id);
                  const isFounder = id === guild.createdByUserId;
                  const isCofounder = id === guild.cofounderUserId;
                  const canSetCofounder = isCreator && !isFounder && id !== guild.cofounderUserId;
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
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isFounder && <span className="text-[10px] font-semibold text-uri-gold px-1.5 py-0.5 rounded bg-uri-gold/20">Founder</span>}
                        {isCofounder && <span className="text-[10px] font-semibold text-uri-keaney px-1.5 py-0.5 rounded bg-uri-keaney/20">Co-founder</span>}
                        {canSetCofounder && (
                          <button
                            type="button"
                            onClick={() => { setGuildCofounder(guild.id, currentUserId!, id); onUpdated?.(); }}
                            className="text-[10px] font-medium text-uri-keaney/90 hover:text-uri-keaney px-1.5 py-0.5 rounded border border-uri-keaney/40 hover:bg-uri-keaney/10"
                          >
                            Set co-founder
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {isCreator && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 rounded-xl font-medium text-red-400/90 border border-red-400/40 hover:bg-red-400/10 transition-colors"
              >
                Delete guild
              </button>
            )}
            {isMember && onLeave && !isCreator && (
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

  const deleteConfirmContent = showDeleteConfirm ? (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-guild-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} aria-hidden />
      <div className="relative z-10 w-full max-w-[20rem] rounded-2xl border border-white/15 bg-uri-navy shadow-xl p-6">
        <h3 id="delete-guild-title" className="font-display font-semibold text-white mb-2">Delete guild?</h3>
        <p className="text-sm text-white/70 mb-6">
          Are you sure you want to delete <strong className="text-white">{guild.name}</strong>? This cannot be undone and all members will be removed.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 py-2.5 rounded-xl font-medium text-white/80 bg-white/10 border border-white/15 hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-red-500/90 hover:bg-red-500 border border-red-400/50"
          >
            Delete guild
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (typeof document === "undefined") return null;
  return (
    <>
      {createPortal(content, document.body)}
      {showDeleteConfirm && deleteConfirmContent && createPortal(deleteConfirmContent, document.body)}
    </>
  );
}
