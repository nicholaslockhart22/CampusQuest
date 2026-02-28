"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createCharacter } from "@/lib/store";
import { getDefaultCustomAvatar, serializeAvatar } from "@/lib/avatarOptions";
import type { CharacterClassId } from "@/lib/characterClasses";
import { AvatarBuilder } from "./AvatarBuilder";
import { AvatarDisplay } from "./AvatarDisplay";

const USERNAME_REGEX = /^[a-z0-9_]+$/;
const USERNAME_MAX = 25;
const NAME_MAX = 40;

function toUsername(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, USERNAME_MAX);
}

export function CharacterGate({ onReady }: { onReady: () => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(() => serializeAvatar(getDefaultCustomAvatar()));
  const [classId, setClassId] = useState<CharacterClassId | null>(null);
  const [starterWeapon, setStarterWeapon] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameTrimmed = name.trim();
  const usernameNormalized = toUsername(username || nameTrimmed);
  const nameValid = nameTrimmed.length >= 1 && nameTrimmed.length <= NAME_MAX;
  const usernameValid =
    usernameNormalized.length >= 1 &&
    usernameNormalized.length <= USERNAME_MAX &&
    USERNAME_REGEX.test(usernameNormalized);

  const canSubmit = nameValid && usernameValid && avatar.length > 0;

  const handleNameChange = useCallback((value: string) => {
    const next = value.slice(0, NAME_MAX);
    setName(next);
    setSubmitError(null);
    if (!username) setUsername(toUsername(next));
  }, [username]);

  const handleUsernameChange = useCallback((value: string) => {
    setUsername(toUsername(value));
    setSubmitError(null);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) return;
    setShowConfirm(true);
  }

  function handleConfirm() {
    if (!canSubmit) return;
    try {
      createCharacter(nameTrimmed, avatar, undefined, {
        username: usernameNormalized,
        classId: classId ?? undefined,
        starterWeapon: starterWeapon ?? undefined,
      });
      setShowConfirm(false);
      onReady();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  const confirmModal =
    showConfirm &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-character-title"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
          aria-hidden
        />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/15 bg-uri-navy shadow-xl p-6 text-center">
          <h2 id="confirm-character-title" className="font-display font-bold text-lg text-white mb-2">
            Create this character?
          </h2>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-uri-keaney/30 flex items-center justify-center overflow-hidden">
              <AvatarDisplay avatar={avatar} size={64} />
            </div>
          </div>
          <p className="text-white/90 font-medium">{nameTrimmed}</p>
          <p className="text-sm text-uri-keaney/90">@{usernameNormalized}</p>
          {submitError && (
            <p className="mt-2 text-sm text-amber-400" role="alert">
              {submitError}
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 rounded-xl font-medium text-white/80 bg-white/10 border border-white/15 hover:bg-white/15"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-uri-keaney hover:bg-uri-keaney/90 focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:ring-offset-2 focus:ring-offset-uri-navy"
            >
              Create character
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <section
        className="max-w-lg mx-auto mt-6 sm:mt-10 px-4"
        aria-label="Create your character"
      >
        <div className="rounded-2xl border border-uri-keaney/30 bg-uri-navy/80 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 pb-4 text-center border-b border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-uri-keaney/30 to-uri-navy border border-uri-keaney/40 flex items-center justify-center text-3xl">
              🐏
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-1">
              Create your character
            </h1>
            <p className="text-sm text-white/60">
              Name, username, and avatar. You can change details later.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4 space-y-6">
            {/* Step 1: Name */}
            <div className="space-y-2">
              <label htmlFor="char-name" className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Display name <span className="text-amber-400">*</span>
              </label>
              <input
                id="char-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={NAME_MAX}
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/50 focus:border-uri-keaney/50"
                aria-required
                aria-invalid={name.length > 0 && !nameValid}
              />
              {name.length > 0 && !nameValid && (
                <p className="text-xs text-amber-400">Use 1–40 characters.</p>
              )}
            </div>

            {/* Step 2: Username */}
            <div className="space-y-2">
              <label htmlFor="char-username" className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Username <span className="text-amber-400">*</span>
              </label>
              <input
                id="char-username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="e.g. alex_rhody"
                maxLength={USERNAME_MAX}
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-keaney/50 focus:border-uri-keaney/50 font-mono text-sm"
                aria-required
                aria-invalid={usernameNormalized.length > 0 && !usernameValid}
              />
              <p className="text-xs text-white/50">
                Letters, numbers, underscores only. You’ll appear as @{usernameNormalized || "username"}
              </p>
              {usernameNormalized.length > 0 && !usernameValid && (
                <p className="text-xs text-amber-400">Username must be 1–25 characters, only a–z, 0–9, and _.</p>
              )}
            </div>

            {/* Step 3: Avatar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Avatar
              </label>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 max-h-[50vh] overflow-y-auto">
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
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-uri-keaney hover:bg-uri-keaney/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:ring-offset-2 focus:ring-offset-uri-navy transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </section>

      {confirmModal}
    </>
  );
}
