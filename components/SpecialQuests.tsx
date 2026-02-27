"use client";

import { useState, useRef } from "react";
import { getSpecialQuests } from "@/lib/specialQuests";
import { completeSpecialQuest } from "@/lib/store";
import type { Character } from "@/lib/types";

export function SpecialQuests({
  character,
  compact = false,
  onClaim,
}: {
  character: Character;
  compact?: boolean;
  onClaim?: () => void;
}) {
  const quests = getSpecialQuests();
  const completedIds = new Set(character.completedSpecialQuests ?? []);
  const proofs = character.specialQuestProofs ?? {};
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [proofInput, setProofInput] = useState("");
  const [proofError, setProofError] = useState<string | null>(null);
  const proofFileRef = useRef<HTMLInputElement>(null);

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProofError("Please choose an image file (e.g. JPEG, PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProofInput((reader.result as string) ?? "");
      setProofError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSubmitClaim(questId: string) {
    setProofError(null);
    const proof = proofInput.trim();
    if (!proof) {
      setProofError("Add proof (photo link or note) from the event to claim.");
      return;
    }
    const updated = completeSpecialQuest(character.id, questId, proof);
    if (updated) {
      setClaimingQuestId(null);
      setProofInput("");
      onClaim?.();
    } else {
      setProofError("Could not claim. Check that proof is provided.");
    }
  }

  const content = (
    <>
      <h3 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
        <span aria-hidden>⭐</span> Special Quests
      </h3>
      <p className="text-xs text-white/80 mb-3">One-time campus quests — post proof at the event to claim XP.</p>
      <div className="space-y-2">
        {quests.map((q) => {
          const done = completedIds.has(q.id);
          const isClaiming = claimingQuestId === q.id;
          return (
            <div
              key={q.id}
              className={`flex flex-col gap-2 p-3 rounded-xl border ${done ? "bg-uri-gold/15 border-uri-gold/40" : "bg-white/15 border-white/25"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{q.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">{q.title}</div>
                  <div className="text-xs text-white/80 mt-0.5">{q.description}</div>
                  <div className="text-xs text-uri-gold/90 font-mono mt-1">+{q.xpReward} XP</div>
                  {done && proofs[q.id] && (
                    <p className="text-xs text-white/50 mt-1 truncate" title={proofs[q.id]}>
                      Proof: {proofs[q.id]}
                    </p>
                  )}
                </div>
                {done ? (
                  <span className="text-uri-gold text-lg">✓</span>
                ) : isClaiming ? null : (
                  <button
                    type="button"
                    onClick={() => {
                      setClaimingQuestId(q.id);
                      setProofInput("");
                      setProofError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-uri-gold/20 text-uri-gold border border-uri-gold/40 hover:bg-uri-gold/30 transition-colors flex-shrink-0"
                  >
                    Claim
                  </button>
                )}
              </div>
              {isClaiming && (
                <div className="mt-1 pt-2 border-t border-white/10 space-y-2">
                  <label className="block text-xs font-medium text-white/70">
                    Proof from the event (required) — photo or short note
                  </label>
                  <input
                    type="text"
                    value={proofInput.startsWith("data:") ? "" : proofInput}
                    onChange={(e) => setProofInput(e.target.value)}
                    placeholder="Paste image URL or describe your proof"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-uri-gold/40"
                  />
                  <input
                    ref={proofFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProofFileChange}
                    className="hidden"
                    aria-label="Add photo from device"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => proofFileRef.current?.click()}
                      className="text-xs font-medium text-uri-gold hover:text-uri-gold/80 px-3 py-2 rounded-lg border border-uri-gold/40 hover:bg-uri-gold/10 transition-colors"
                    >
                      📷 Add photo from device
                    </button>
                    {proofInput.startsWith("data:") && (
                      <>
                        <span className="text-xs text-uri-gold/90">Image attached</span>
                        <div className="w-full mt-1 rounded-lg overflow-hidden border border-white/15 max-w-[120px]">
                          <img src={proofInput} alt="Proof" className="w-full h-20 object-cover" />
                        </div>
                      </>
                    )}
                  </div>
                  {proofError && <p className="text-xs text-amber-400">{proofError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setClaimingQuestId(null);
                        setProofInput("");
                        setProofError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitClaim(q.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-uri-gold/80 text-uri-navy hover:bg-uri-gold"
                    >
                      Submit proof & claim +{q.xpReward} XP
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  if (compact) {
    return <div className="p-3 sm:p-4">{content}</div>;
  }
  return <section className="card p-4 sm:p-5">{content}</section>;
}
