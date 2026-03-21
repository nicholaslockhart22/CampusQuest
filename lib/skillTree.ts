import type { StatKey } from "./types";

export interface SkillNodeDef {
  id: string;
  stat: StatKey;
  label: string;
  description: string;
  icon: string;
  /** Parent skill ids (all must be unlocked). Empty = root. */
  requires: string[];
  /** XP multiplier for matching activities (e.g. 0.05 = +5%). */
  xpBonusPct: number;
  /** If set, bonus only applies when activity id matches. */
  activityIds?: string[];
  /** If set, bonus applies when activity stat matches. */
  activityStat?: StatKey;
}

export const SKILL_TREE_NODES: SkillNodeDef[] = [
  {
    id: "sk_strength_foundation",
    stat: "strength",
    label: "Iron Base",
    description: "+5% XP on gym, weights, HIIT",
    icon: "💪",
    requires: [],
    xpBonusPct: 0.05,
    activityIds: ["gym", "weights", "hiit", "bodyweight"],
  },
  {
    id: "sk_power_lift",
    stat: "strength",
    label: "Power Lift",
    description: "+8% XP on gym & weights (stacks with base)",
    icon: "🏋️",
    requires: ["sk_strength_foundation"],
    xpBonusPct: 0.08,
    activityIds: ["gym", "weights"],
  },
  {
    id: "sk_knowledge_exam",
    stat: "knowledge",
    label: "Exam Prep Boost",
    description: "+8% XP on exam prep & study",
    icon: "📚",
    requires: [],
    xpBonusPct: 0.08,
    activityIds: ["exam-prep", "study", "textbook"],
  },
  {
    id: "sk_social_squad",
    stat: "social",
    label: "Squad XP",
    description: "+10% XP on group study, club, game night",
    icon: "👥",
    requires: [],
    xpBonusPct: 0.1,
    activityIds: ["group-study", "club", "game-night"],
  },
  {
    id: "sk_focus_deep",
    stat: "focus",
    label: "Deep Work",
    description: "+6% XP on deep focus & Pomodoro",
    icon: "🎯",
    requires: [],
    xpBonusPct: 0.06,
    activityIds: ["deep-focus", "pomodoro", "no-phone"],
  },
  {
    id: "sk_stamina_runner",
    stat: "stamina",
    label: "Endurance",
    description: "+7% XP on run, swim, cycle",
    icon: "🏃",
    requires: [],
    xpBonusPct: 0.07,
    activityIds: ["run", "swim", "cycle", "hike"],
  },
];

export function getSkillNode(id: string): SkillNodeDef | undefined {
  return SKILL_TREE_NODES.find((n) => n.id === id);
}

export function canUnlockSkill(unlocked: string[], nodeId: string): boolean {
  const n = getSkillNode(nodeId);
  if (!n) return false;
  if (unlocked.includes(nodeId)) return false;
  return n.requires.every((r) => unlocked.includes(r));
}

export function skillXpMultiplierForActivity(unlocked: string[], activityId: string, activityStat: StatKey): number {
  let mult = 1;
  for (const id of unlocked) {
    const n = getSkillNode(id);
    if (!n) continue;
    let applies = false;
    if (n.activityIds?.length) {
      applies = n.activityIds.includes(activityId);
    } else if (n.activityStat) {
      applies = n.activityStat === activityStat;
    }
    if (applies) mult += n.xpBonusPct;
  }
  return mult;
}

/** Skill points = level - 1 - number of unlocked nodes (min 0). */
export function availableSkillPoints(level: number, unlockedCount: number): number {
  return Math.max(0, level - 1 - unlockedCount);
}
