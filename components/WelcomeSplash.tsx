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

      <div className="relative flex flex-col items-center justify-center gap-5 px-4">
        <p className="welcome-splash-title text-uri-keaney/95 text-sm sm:text-base font-semibold tracking-[0.3em] uppercase">
          Welcome to
        </p>
        <img
          src="/campusquest-logo.png"
          alt="CampusQuest RPG — University of Rhode Island"
          className="welcome-splash-word w-full max-w-[220px] sm:max-w-[260px] md:max-w-[280px] h-auto object-contain drop-shadow-[0_0_24px_rgba(104,171,232,0.25)]"
        />
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
