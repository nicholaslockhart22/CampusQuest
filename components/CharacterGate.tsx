"use client";

import { useState } from "react";
import { createCharacter } from "@/lib/store";

const AVATARS = ["🎓", "🦉", "🐏", "⚡", "🌟", "🔥", "📚", "🏃", "🎯"];

export function CharacterGate({ onReady }: { onReady: () => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("🎓");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createCharacter(name, avatar, username || undefined);
    onReady();
  }

  const handleNameChange = (value: string) => {
    setName(value);
    if (!username) setUsername(value.toLowerCase().replace(/\s+/g, "_").slice(0, 20));
  };

  return (
    <section className="rounded-2xl bg-white/[0.08] border border-white/20 p-6 shadow-xl shadow-black/20 max-w-sm mx-auto mt-12">
      <h2 className="font-display font-bold text-xl text-white mb-1">
        Join CampusQuest
      </h2>
      <p className="text-sm text-white/60 mb-6">
        Your Flock awaits. Enter a username once — you’re in.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-white/60 mb-1">
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Nick"
            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-xs font-medium text-white/60 mb-1">
            Username (for The Quad)
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_").slice(0, 25))}
            placeholder="e.g. nick_lockhart"
            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney"
          />
          <p className="text-xs text-white/40 mt-1">You’ll post as @{username || "username"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">
            Avatar
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                  avatar === a
                    ? "border-uri-keaney bg-uri-keaney/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl font-semibold bg-uri-keaney text-uri-navy hover:bg-uri-keaney/90 transition-colors shadow-md"
        >
          Enter The Quad
        </button>
      </form>
    </section>
  );
}
