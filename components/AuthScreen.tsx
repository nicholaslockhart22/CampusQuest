"use client";

import { useState } from "react";

type Mode = "signin" | "signup";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-uri-keaney/40 focus:border-uri-keaney/50 focus:bg-white/10 transition-all";
const labelClass = "block text-xs font-medium text-white/70 uppercase tracking-wider mb-2";

export function AuthScreen({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      setError("Enter your username and password.");
      return;
    }
    onComplete();
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const eVal = email.trim();
    const p = password.trim();
    if (!eVal || !p) {
      setError("Enter your email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eVal)) {
      setError("Enter a valid email address.");
      return;
    }
    if (p.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    onComplete();
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10 sm:py-14">
      {/* Subtle background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(104, 171, 232, 0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Logo + branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-[200px] sm:max-w-[220px] h-auto mb-4">
            <img
              src="/campusquest-logo.png"
              alt="CampusQuest"
              className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(104,171,232,0.2)]"
            />
          </div>
          <p className="text-uri-keaney/80 text-xs font-medium tracking-[0.2em] uppercase">
            URI · Level up for real
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/20 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                mode === "signin"
                  ? "text-uri-keaney bg-uri-keaney/10 border-b-2 border-uri-keaney"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                mode === "signup"
                  ? "text-uri-keaney bg-uri-keaney/10 border-b-2 border-uri-keaney"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {mode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label htmlFor="auth-username" className={labelClass}>
                    Student username
                  </label>
                  <input
                    id="auth-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jsmith"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-password-signin" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="auth-password-signin"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                {error && (
                  <p className="text-xs text-amber-400/90 bg-amber-400/10 px-3 py-2 rounded-lg border border-amber-400/20">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-uri-keaney text-white font-semibold text-sm hover:bg-uri-keaney/90 focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:ring-offset-2 focus:ring-offset-uri-navy transition-colors shadow-lg shadow-uri-keaney/20"
                >
                  Sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label htmlFor="auth-email" className={labelClass}>
                    Student email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@uri.edu"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-password-signup" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="auth-password-signup"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={inputClass}
                  />
                </div>
                {error && (
                  <p className="text-xs text-amber-400/90 bg-amber-400/10 px-3 py-2 rounded-lg border border-amber-400/20">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-uri-keaney text-white font-semibold text-sm hover:bg-uri-keaney/90 focus:outline-none focus:ring-2 focus:ring-uri-keaney focus:ring-offset-2 focus:ring-offset-uri-navy transition-colors shadow-lg shadow-uri-keaney/20"
                >
                  Create account
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Sign in with your campus credentials to track progress and earn XP.
        </p>
      </div>
    </div>
  );
}
