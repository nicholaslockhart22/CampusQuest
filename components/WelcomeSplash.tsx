"use client";

import { useState, useEffect } from "react";

const SPLASH_HOLD_MS = 2200;
const SPLASH_FADEOUT_MS = 700;

export function WelcomeSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"visible" | "fading">("visible");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("fading"), SPLASH_HOLD_MS);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const doneTimer = setTimeout(onComplete, SPLASH_FADEOUT_MS);
    return () => clearTimeout(doneTimer);
  }, [phase, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-uri-navy transition-opacity duration-700 ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Subtle radial glow behind text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 45%, rgba(104, 171, 232, 0.2) 0%, transparent 60%)",
        }}
      />
      {/* Accent rays */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: "linear-gradient(135deg, transparent 40%, rgba(104, 171, 232, 0.08) 50%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center justify-center gap-6 px-4">
        <span className="welcome-splash-emoji text-5xl sm:text-6xl" aria-hidden>
          🐏
        </span>
        <h1 className="welcome-splash-title font-display font-bold text-center text-3xl sm:text-4xl md:text-5xl tracking-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-uri-keaney via-white to-uri-keaney">
            WELCOME TO
          </span>
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-uri-gold via-amber-200 to-uri-gold welcome-splash-word">
            CAMPUSQUEST
          </span>
        </h1>
        <p className="welcome-splash-tagline text-uri-keaney/90 text-sm sm:text-base font-medium tracking-widest uppercase">
          URI · Level up for real
        </p>
      </div>

      {/* Bottom decorative line */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 h-px w-48 rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(104, 171, 232, 0.6), transparent)" }}
      />
    </div>
  );
}
