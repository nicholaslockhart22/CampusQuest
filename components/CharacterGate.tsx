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
    <section className="card p-6 sm:p-8 max-w-md mx-auto mt-8 sm:mt-12">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-white mb-2">
          Welcome to CampusQuest
        </h2>
        <p className="text-sm text-white/60 max-w-xs mx-auto">
          Create your character and start leveling up with real campus life.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/60 focus:border-uri-keaney/50 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_").slice(0, 25))}
            placeholder="e.g. alex_rhody"
            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney"
          />
          <p className="text-xs text-white/40 mt-1">You’ll post as @{username || "username"}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Choose avatar
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                  avatar === a
                    ? "border-uri-keaney bg-uri-keaney/25 ring-2 ring-uri-keaney/40"
                    : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/10"
                }`}
                aria-pressed={avatar === a}
                aria-label={`Select avatar ${a}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-xl font-semibold bg-uri-keaney text-white hover:bg-uri-keaney/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-keaney"
        >
          Get started
        </button>
      </form>
    </section>
  );
}
