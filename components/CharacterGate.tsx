"use client";

import { useState } from "react";
import { createCharacter } from "@/lib/store";
import { getDefaultCustomAvatar, serializeAvatar } from "@/lib/avatarOptions";
import type { CharacterClassId } from "@/lib/characterClasses";
import { AvatarBuilder } from "./AvatarBuilder";

export function CharacterGate({ onReady }: { onReady: () => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(() => serializeAvatar(getDefaultCustomAvatar()));
  const [classId, setClassId] = useState<CharacterClassId | null>(null);
  const [starterWeapon, setStarterWeapon] = useState<string | null>(null);
  const [showOath, setShowOath] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowOath(true);
  }

  function confirmOath() {
    createCharacter(name.trim(), avatar, undefined, {
      username: username || undefined,
      classId: classId ?? undefined,
      starterWeapon: starterWeapon ?? undefined,
    });
    setShowOath(false);
    onReady();
  }

  const handleNameChange = (value: string) => {
    setName(value);
    if (!username) setUsername(value.toLowerCase().replace(/\s+/g, "_").slice(0, 20));
  };

  return (
    <>
      <section className="card p-6 sm:p-8 max-w-md mx-auto mt-8 sm:mt-12">
        <div className="text-center mb-8">
          <img
            src="/campusquest-logo.png"
            alt="CampusQuest RPG"
            className="mx-auto w-full max-w-[160px] h-auto object-contain mb-4"
          />
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
              Create your avatar
            </label>
            <div className="max-h-[50vh] overflow-y-auto pr-1">
              <AvatarBuilder
                value={avatar}
                onChange={setAvatar}
                showClassPresets
                selectedClassId={classId}
                onClassChange={setClassId}
                selectedWeapon={starterWeapon}
                onWeaponChange={setStarterWeapon}
              />
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

      {showOath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" aria-modal="true" role="dialog">
          <div className="card p-6 sm:p-8 max-w-sm w-full text-center space-y-6">
            <p className="font-display text-lg sm:text-xl text-white leading-relaxed">
              Hark, brave Ram! Dost thou swear this likeness be thy true form upon the CampusQuest battlefield?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={confirmOath}
                className="px-6 py-3 rounded-xl font-semibold bg-uri-keaney text-white hover:bg-uri-keaney/90 shadow-lg"
              >
                Aye, I swear it
              </button>
              <button
                type="button"
                onClick={() => setShowOath(false)}
                className="px-6 py-3 rounded-xl font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25"
              >
                Nay, I shall revise
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
