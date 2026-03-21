import { todayString } from "./dateUtils";

export interface SurpriseQuestDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Activity ids that complete this quest when logged */
  matchingActivityIds: string[];
  xpReward: number;
}

const POOL: SurpriseQuestDef[] = [
  {
    id: "sq_library",
    title: "Library pilgrimage",
    description: "Log a study session today (+50 XP bonus when complete)",
    icon: "📍",
    matchingActivityIds: ["study", "textbook", "flashcards", "exam-prep"],
    xpReward: 50,
  },
  {
    id: "sq_social",
    title: "New connection",
    description: "Talk to someone new — log coffee chat or club (+30 XP)",
    icon: "👥",
    matchingActivityIds: ["coffee-chat", "club", "meal-together"],
    xpReward: 30,
  },
  {
    id: "sq_move",
    title: "Campus miles",
    description: "Run, walk, or hit the gym today (+35 XP)",
    icon: "🏃",
    matchingActivityIds: ["run", "hike", "gym", "bodyweight"],
    xpReward: 35,
  },
  {
    id: "sq_focus",
    title: "Laser block",
    description: "Complete a deep focus or Pomodoro log (+28 XP)",
    icon: "🎯",
    matchingActivityIds: ["deep-focus", "pomodoro", "no-phone"],
    xpReward: 28,
  },
  {
    id: "sq_network",
    title: "Career spark",
    description: "Office hours or volunteer / org meeting (+32 XP)",
    icon: "💼",
    matchingActivityIds: ["office-hours", "volunteer"],
    xpReward: 32,
  },
];

function hashDay(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic daily surprise for a character. */
export function getTodaysSurpriseQuest(characterId: string): SurpriseQuestDef {
  const day = todayString();
  const h = hashDay(`${characterId}:${day}`);
  return POOL[h % POOL.length];
}
