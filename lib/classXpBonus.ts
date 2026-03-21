import type { CharacterClassId } from "./characterClasses";

const STRENGTH_IDS = new Set(["gym", "weights", "bodyweight", "sports-practice", "hiit"]);
const KNOWLEDGE_IDS = new Set([
  "exam-prep",
  "study",
  "textbook",
  "office-hours",
  "flashcards",
  "lab",
]);
const SOCIAL_IDS = new Set([
  "group-study",
  "club",
  "coffee-chat",
  "game-night",
  "volunteer",
  "meal-together",
]);
const FOCUS_IDS = new Set(["deep-focus", "meditate", "pomodoro", "no-phone", "journal", "plan-week"]);
const STAMINA_IDS = new Set(["run", "swim", "cycle", "hike", "dance"]);

/** Multiplicative class bonus (e.g. 0.08 = +8% XP for matching activities). */
export function getClassXpMultiplier(classId: string | undefined, activityId: string): number {
  if (!classId) return 1;
  let bonus = 0;
  switch (classId as CharacterClassId) {
    case "gym":
      if (STRENGTH_IDS.has(activityId) || STAMINA_IDS.has(activityId)) bonus = 0.1;
      break;
    case "knight":
      if (KNOWLEDGE_IDS.has(activityId)) bonus = 0.08;
      break;
    case "mage":
      if (KNOWLEDGE_IDS.has(activityId)) bonus = 0.12;
      if (FOCUS_IDS.has(activityId)) bonus = Math.max(bonus, 0.06);
      break;
    case "bard":
      if (SOCIAL_IDS.has(activityId)) bonus = 0.14;
      break;
    case "rogue":
      if (KNOWLEDGE_IDS.has(activityId) || activityId === "office-hours" || activityId === "volunteer") bonus = 0.09;
      break;
    default:
      break;
  }
  return 1 + bonus;
}
