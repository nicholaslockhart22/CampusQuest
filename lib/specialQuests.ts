import type { SpecialQuest } from "./types";

/** Fixed special campus quests — higher XP than daily quests. One-time claim. */
export const SPECIAL_QUESTS: SpecialQuest[] = [
  {
    id: "sq-career-fair",
    title: "Career fair or info session",
    description: "Attend a career fair or employer info session",
    xpReward: 75,
    icon: "💼",
  },
  {
    id: "sq-uri-gear",
    title: "URI gear at a game",
    description: "Wear URI gear to a sports event",
    xpReward: 75,
    icon: "🐏",
  },
  {
    id: "sq-lecture-event",
    title: "Campus lecture or event",
    description: "Attend a campus lecture or event",
    xpReward: 100,
    icon: "🎓",
  },
];

export function getSpecialQuests(): SpecialQuest[] {
  return [...SPECIAL_QUESTS];
}

export function getSpecialQuestById(id: string): SpecialQuest | undefined {
  return SPECIAL_QUESTS.find((q) => q.id === id);
}
