import type { ActivityDefinition } from "./types";

// Real-life actions: base XP per spec (gym 25, study 20, focus 15, social 10); study/focus scale with minutes
export const ACTIVITIES: ActivityDefinition[] = [
  {
    id: "gym",
    label: "Hit the gym",
    description: "Workout, lift, or cardio",
    stat: "strength",
    baseXp: 25,
    xp: 25,
    statGain: 2,
    icon: "🏋️",
  },
  {
    id: "study",
    label: "Study session",
    description: "Notes, reading, or practice problems",
    stat: "knowledge",
    baseXp: 20,
    xp: 20,
    statGain: 1,
    icon: "📖",
    usesMinutes: true,
  },
  {
    id: "club",
    label: "Club or hangout",
    description: "Join a club or hang with friends",
    stat: "social",
    baseXp: 10,
    xp: 10,
    statGain: 1,
    icon: "👥",
  },
  {
    id: "deep-focus",
    label: "Deep focus",
    description: "Uninterrupted work block (e.g. 90 min)",
    stat: "focus",
    baseXp: 15,
    xp: 15,
    statGain: 1,
    icon: "🎯",
    usesMinutes: true,
  },
  {
    id: "run",
    label: "Run or cardio",
    description: "Running, biking, or sports",
    stat: "stamina",
    baseXp: 12,
    xp: 12,
    statGain: 4,
    icon: "🏃",
  },
  {
    id: "exam-prep",
    label: "Exam prep",
    description: "Review or practice for an exam",
    stat: "knowledge",
    baseXp: 25,
    xp: 25,
    statGain: 2,
    icon: "✍️",
    usesMinutes: true,
  },
  {
    id: "group-study",
    label: "Group study",
    description: "Study with others",
    stat: "social",
    baseXp: 18,
    xp: 18,
    statGain: 6,
    icon: "📝",
  },
  {
    id: "meditate",
    label: "Meditate or plan",
    description: "Meditation or daily planning",
    stat: "focus",
    baseXp: 10,
    xp: 10,
    statGain: 4,
    icon: "🧘",
  },
];

export function getActivityById(id: string): ActivityDefinition | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

/** Activity types that deal damage to boss (study/exam-prep) */
export function isStudyActivityForBoss(activityId: string): boolean {
  return activityId === "study" || activityId === "exam-prep";
}
