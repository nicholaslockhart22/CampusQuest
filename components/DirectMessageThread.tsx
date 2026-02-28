"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Character } from "@/lib/types";
import type { Friend } from "@/lib/types";
import { getMessages, sendMessage, canMessage } from "@/lib/dmStore";
import { AvatarDisplay } from "./AvatarDisplay";

export function DirectMessageThread({
  currentUser,
  otherUser,
  onClose,
  onMessageSent,
}: {
  currentUser: Character;
  otherUser: Pick<Friend, "userId" | "username" | "name" | "avatar">;
  onClose: () => void;
  onMessageSent?: () => void;
}) {
  const [messages, setMessages] = useState(() =>
    getMessages(
      [currentUser.id, otherUser.userId].sort().join("|")
    )
  );
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const conversationId = [currentUser.id, otherUser.userId].sort().join("|");
  const allowed = canMessage(currentUser.id, otherUser.userId);

  useEffect(() => {
    setMessages(getMessages(conversationId));
  }, [conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !allowed) return;
    const msg = sendMessage(currentUser.id, otherUser.userId, trimmed);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setInput("");
      onMessageSent?.();
    }
  }

  const content = (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-uri-navy"
      role="dialog"
      aria-modal="true"
      aria-label={`Direct message with ${otherUser.name}`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex flex-col flex-1 min-h-0 max-h-[100vh] w-full max-w-lg mx-auto rounded-t-2xl border border-b-0 border-uri-keaney/20 bg-uri-navy shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Close"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-uri-keaney/30">
            <AvatarDisplay avatar={otherUser.avatar} size={40} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white truncate">{otherUser.name}</p>
            <p className="text-xs text-uri-keaney/90 truncate">@{otherUser.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        >
          {messages.length === 0 && (
            <p className="text-sm text-white/50 text-center py-6">
              No messages yet. Say hi!
            </p>
          )}
          {messages.map((m) => {
            const isMe = m.fromUserId === currentUser.id;
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-uri-keaney text-uri-navy rounded-br-md"
                      : "bg-white/15 text-white border border-white/10 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-uri-navy/70" : "text-white/50"}`}>
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        {allowed ? (
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                placeholder="Message..."
                maxLength={2000}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2.5 rounded-xl font-semibold bg-uri-keaney text-uri-navy hover:bg-uri-keaney/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        ) : (
          <p className="p-3 text-center text-sm text-amber-400/90">
            You must be friends to message.
          </p>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
