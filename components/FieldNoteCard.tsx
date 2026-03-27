"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldNote, QuadComment, StatKey } from "@/lib/types";
import { QUAD_COMMENT_MAX_CHARS } from "@/lib/types";
import { AvatarDisplay } from "./AvatarDisplay";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
  return d.toLocaleDateString();
}

function streakBadge(days: number | undefined): string | null {
  if (days == null || days < 3) return null;
  if (days >= 30) return `🔥 ${days}-day streak`;
  if (days >= 7) return `🔥 ${days}-day streak`;
  return `🔥 ${days}d`;
}

/** Treat common CDN URLs as images even when the path has no file extension. */
function looksLikeImageProofUrl(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith("data:image/")) return true;
  // App-hosted proof assets (Quad seed images, etc.)
  if (/^\/[\w./-]+\.(jpe?g|png|gif|webp)(\?|#|$)/i.test(u)) return true;
  if (/\.(jpe?g|png|gif|webp)(\?|#|$|\/)/i.test(u)) return true;
  if (/images\.unsplash\.com\/photo-/i.test(u)) return true;
  if (/upload\.wikimedia\.org\//i.test(u)) return true;
  if (/picsum\.photos\/(?:id\/|seed\/|\d)/i.test(u)) return true;
  return false;
}

export function FieldNoteCard({
  note,
  currentUserId,
  comments = [],
  onNod,
  onHype,
  onVerify,
  onAssist,
  onAddComment,
  currentUser,
  highlightStat,
  variant = "default",
}: {
  note: FieldNote;
  currentUserId: string;
  comments?: QuadComment[];
  onNod: (noteId: string) => void;
  onHype: (noteId: string) => void;
  onVerify: (noteId: string) => void;
  onAssist: (noteId: string) => void;
  onAddComment?: (noteId: string, body: string) => void;
  currentUser?: { id: string; name: string; username: string; avatar: string };
  /** Micro celebration on author row when this post's activity matches */
  highlightStat?: StatKey | null;
  /** `feed` = full-width media, border-between-posts (Quad). `default` = padded card row (Profile). */
  variant?: "default" | "feed";
}) {
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showImageNodPop, setShowImageNodPop] = useState(false);
  const lastImageTapAtRef = useRef(0);
  const nodPopTimerRef = useRef<number | null>(null);
  const hasNodded = note.nodByUserIds.has(currentUserId);
  const hasHyped = note.hypeByUserIds?.has(currentUserId) ?? note.vouchByUserIds.has(currentUserId);
  const hasVerified = note.verifyByUserIds?.has(currentUserId) ?? false;
  const hasAssisted = note.assistByUserIds?.has(currentUserId) ?? false;

  const proofImgUrl = note.proofUrl?.trim();
  const isImgUrl = proofImgUrl && looksLikeImageProofUrl(proofImgUrl);
  const streak = streakBadge(note.authorStreakDays);
  const isFeed = variant === "feed";

  useEffect(() => {
    return () => {
      if (nodPopTimerRef.current != null) {
        window.clearTimeout(nodPopTimerRef.current);
        nodPopTimerRef.current = null;
      }
    };
  }, []);

  function triggerImageNodPop() {
    if (nodPopTimerRef.current != null) {
      window.clearTimeout(nodPopTimerRef.current);
      nodPopTimerRef.current = null;
    }
    setShowImageNodPop(false);
    window.setTimeout(() => {
      setShowImageNodPop(true);
      nodPopTimerRef.current = window.setTimeout(() => {
        setShowImageNodPop(false);
        nodPopTimerRef.current = null;
      }, 880);
    }, 0);
  }

  function addNodFromImage() {
    // Double-tap should add a nod, not toggle it off.
    if (!hasNodded) onNod(note.id);
    triggerImageNodPop();
  }

  function handleProofImageTap() {
    const now = Date.now();
    if (now - lastImageTapAtRef.current < 280) {
      addNodFromImage();
      lastImageTapAtRef.current = 0;
      return;
    }
    lastImageTapAtRef.current = now;
  }

  const avatarFrame = (
    <div
      className={`flex items-center justify-center flex-shrink-0 border overflow-hidden ${
        isFeed
          ? "h-11 w-11 rounded-full border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.04] shadow-inner shadow-black/20 ring-2 ring-uri-keaney/25 ring-offset-2 ring-offset-[#050f22]"
          : "w-11 h-11 rounded-xl bg-gradient-to-br from-uri-keaney/25 to-uri-navy border-uri-keaney/30"
      } ${
        highlightStat === "strength"
          ? "stat-aura-strength"
          : highlightStat === "knowledge"
            ? "stat-aura-knowledge"
            : ""
      }`}
    >
      <AvatarDisplay avatar={note.authorAvatar} size={isFeed ? 44 : 44} />
    </div>
  );

  const proofBlock =
    proofImgUrl &&
    (isImgUrl ? (
      isFeed ? (
        <button
          type="button"
          onDoubleClick={addNodFromImage}
          onTouchEnd={handleProofImageTap}
          className="group relative block w-full cursor-pointer touch-manipulation"
          aria-label="Double tap image to nod"
        >
          <img
            src={proofImgUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="quad-feed-media-img w-full aspect-[4/5] sm:aspect-[4/3] sm:max-h-[min(72vh,32rem)] object-cover"
          />
          {showImageNodPop && (
            <span
              className="quad-image-nod-pop pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 select-none"
              aria-hidden
            >
              👍
            </span>
          )}
        </button>
      ) : (
        <img
          src={proofImgUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full max-h-48 object-cover"
        />
      )
    ) : (
      <a
        href={proofImgUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-uri-keaney text-sm truncate bg-white/5 ${isFeed ? "px-4 py-3" : "px-3 py-2"}`}
      >
        📎 Proof link
      </a>
    ));

  const feedActionBtn =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium backdrop-blur-sm transition-all active:scale-[0.97]";
  const actionsRow = (
    <div
      className={
        isFeed
          ? "flex flex-wrap items-center gap-2"
          : "mt-3 flex flex-wrap items-center gap-1 border-t border-white/10 pt-3"
      }
    >
      <button
        type="button"
        onClick={() => onNod(note.id)}
        className={`${!isFeed ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors" : feedActionBtn} ${
          hasNodded
            ? isFeed
              ? "border-uri-gold/50 bg-uri-gold/15 text-uri-gold shadow-[0_0_20px_-4px_rgba(197,160,40,0.45)]"
              : "bg-uri-gold/10 text-uri-gold"
            : isFeed
              ? "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              : "text-white/55 hover:bg-white/5 hover:text-uri-gold"
        }`}
        aria-label={hasNodded ? "Remove nod" : "Nod"}
      >
        <span className="text-base leading-none">👍</span>
        <span>Nod</span>
        {note.nodCount > 0 && <span className="tabular-nums text-xs opacity-80">{note.nodCount}</span>}
      </button>
      <button
        type="button"
        onClick={() => onHype(note.id)}
        className={`${!isFeed ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors" : feedActionBtn} ${
          hasHyped
            ? isFeed
              ? "border-orange-400/40 bg-orange-500/20 text-orange-100 shadow-[0_0_20px_-4px_rgba(251,146,60,0.4)]"
              : "bg-orange-500/15 text-orange-300"
            : isFeed
              ? "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              : "text-white/55 hover:bg-white/5 hover:text-orange-200"
        }`}
        aria-label={hasHyped ? "Remove hype" : "Hype"}
        title="Hype — you +2 XP, author +3 XP"
      >
        <span className="text-base leading-none">🔥</span>
        <span>Hype</span>
        {(note.hypeCount ?? note.vouchCount) > 0 && (
          <span className="tabular-nums text-xs opacity-80">{note.hypeCount ?? note.vouchCount}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => onVerify(note.id)}
        className={`${!isFeed ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors" : feedActionBtn} ${
          hasVerified
            ? isFeed
              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100 shadow-[0_0_20px_-4px_rgba(52,211,153,0.35)]"
              : "bg-emerald-500/15 text-emerald-300"
            : isFeed
              ? "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              : "text-white/55 hover:bg-white/5 hover:text-emerald-200"
        }`}
        aria-label={hasVerified ? "Remove verify" : "Verify"}
        title="Verify legit — you +5 XP, author +5 XP"
      >
        <span className="text-base leading-none">✅</span>
        <span>Verify</span>
        {(note.verifyCount ?? 0) > 0 && <span className="tabular-nums text-xs opacity-80">{note.verifyCount}</span>}
      </button>
      <button
        type="button"
        onClick={() => onAssist(note.id)}
        className={`${!isFeed ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors" : feedActionBtn} ${
          hasAssisted
            ? isFeed
              ? "border-uri-keaney/50 bg-uri-keaney/25 text-white shadow-[0_0_20px_-4px_rgba(104,171,232,0.45)]"
              : "bg-uri-keaney/15 text-uri-keaney"
            : isFeed
              ? "border-white/10 bg-white/[0.04] text-white/70 hover:border-uri-keaney/30 hover:bg-uri-keaney/10 hover:text-uri-keaney"
              : "text-white/55 hover:bg-white/5 hover:text-uri-keaney"
        }`}
        aria-label={hasAssisted ? "Remove assist" : "Assist"}
        title="Assist — guild race points + author XP"
      >
        <span className="text-base leading-none">⚔️</span>
        <span>Assist</span>
        {(note.assistCount ?? 0) > 0 && <span className="tabular-nums text-xs opacity-80">{note.assistCount}</span>}
      </button>
    </div>
  );

  const commentsBlock = (
    <div className={`${isFeed ? "mt-3 border-t border-white/[0.06] pt-3 pb-1" : "mt-3 border-t border-white/10 pt-3"}`}>
      <button
        type="button"
        onClick={() => setCommentsOpen((open) => !open)}
        className={`flex w-full items-center gap-2 rounded-lg py-1.5 text-left font-medium uppercase tracking-wider transition-colors ${
          isFeed
            ? "text-[11px] text-white/40 hover:text-uri-keaney/90"
            : "text-xs text-white/50 hover:text-white/70 -mx-1 px-1"
        }`}
        aria-expanded={commentsOpen}
      >
        <span aria-hidden>{commentsOpen ? "▼" : "▶"}</span>
        <span>Comments {comments.length > 0 && `(${comments.length})`}</span>
      </button>
      {commentsOpen && (
        <>
          {comments.length > 0 && (
            <ul className={`mt-3 mb-3 space-y-2 ${isFeed ? "space-y-2.5" : ""}`}>
              {comments.map((c) => (
                <li
                  key={c.id}
                  className={
                    isFeed
                      ? "flex gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-2.5 shadow-sm shadow-black/20"
                      : "flex gap-2"
                  }
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden border ${
                      isFeed ? "rounded-full border-white/12 bg-black/25" : "rounded-lg border-white/10 bg-white/10"
                    }`}
                  >
                    <AvatarDisplay avatar={c.authorAvatar} size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{c.authorName}</span>
                      <span className="text-xs text-uri-keaney/85">@{c.authorUsername}</span>
                      <span className="text-xs text-white/35">· {formatTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 break-words text-sm leading-relaxed text-white/85 whitespace-pre-wrap">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {onAddComment && currentUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const body = commentDraft.trim().slice(0, QUAD_COMMENT_MAX_CHARS);
                if (!body || commentSubmitting) return;
                setCommentSubmitting(true);
                onAddComment(note.id, body);
                setCommentDraft("");
                setCommentSubmitting(false);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value.slice(0, QUAD_COMMENT_MAX_CHARS))}
                placeholder="Write a comment..."
                maxLength={QUAD_COMMENT_MAX_CHARS}
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm text-white placeholder-white/40 focus:border-uri-keaney/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/40 ${
                  isFeed
                    ? "border-white/[0.1] bg-black/30"
                    : "border-white/15 bg-white/10"
                }`}
              />
              <button
                type="submit"
                disabled={!commentDraft.trim() || commentSubmitting}
                className="px-3 py-2 rounded-xl bg-uri-keaney/80 text-white text-sm font-medium hover:bg-uri-keaney disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Post
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );

  const feedCaption = (
    <p className="break-words whitespace-pre-wrap text-[15px] leading-relaxed text-white/88 sm:text-[16px]">
      <span className="font-semibold text-white">{note.authorName}</span>{" "}
      <span>{note.body}</span>
    </p>
  );

  return (
    <article
      className={
        isFeed
          ? "quad-feed-post border-b border-white/[0.07] bg-gradient-to-b from-white/[0.035] via-transparent to-transparent"
          : "p-4 transition-colors hover:bg-white/[0.04]"
      }
    >
      {isFeed ? (
        <>
          <div className="flex items-start gap-3 px-4 pt-3.5 pb-2">
            {avatarFrame}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[15px] font-semibold tracking-tight text-white">{note.authorName}</span>
                <span className="text-xs text-white/40">{formatTime(note.createdAt)}</span>
                {streak && (
                  <span className="rounded-full border border-uri-gold/35 bg-gradient-to-r from-uri-gold/25 to-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-uri-gold shadow-sm shadow-black/20">
                    {streak}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs font-medium text-uri-keaney/90">@{note.authorUsername}</p>
            </div>
          </div>
          {proofImgUrl && <div className="quad-feed-media-wrap">{proofBlock}</div>}
          <div className="space-y-3 px-4 pb-4 pt-2">
            {actionsRow}
            {feedCaption}
            {note.ramMarks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.ramMarks.map((r) => (
                  <span key={r.id} className="ram-mark ram-mark-feed">
                    #{r.tag}
                  </span>
                ))}
              </div>
            )}
            {commentsBlock}
          </div>
        </>
      ) : (
        <div className="flex gap-3">
          {avatarFrame}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{note.authorName}</span>
              <span className="text-uri-keaney/90 text-sm">@{note.authorUsername}</span>
              <span className="text-white/40 text-xs">· {formatTime(note.createdAt)}</span>
              {streak && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-uri-gold/20 text-uri-gold border border-uri-gold/40">
                  {streak}
                </span>
              )}
            </div>
            <p className="text-white/90 mt-1 whitespace-pre-wrap break-words">{note.body}</p>
            {proofImgUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/15 max-w-full">{proofBlock}</div>
            )}
            {note.ramMarks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {note.ramMarks.map((r) => (
                  <span key={r.id} className="ram-mark">
                    #{r.tag}
                  </span>
                ))}
              </div>
            )}
            {actionsRow}
            {commentsBlock}
          </div>
        </div>
      )}
    </article>
  );
}
